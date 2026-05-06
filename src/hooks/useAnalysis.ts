import { useCallback, useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import type { AdContext, AnalysisRecord, ChatMessage, Difficulty, StepId } from "../types";
import { complete } from "../lib/llm";
import { buildInitialPrompt, buildStepPrompt } from "../lib/prompts";
import { computeScore } from "../lib/scoring";
import { save } from "../lib/storage";

function newRecord(difficulty: Difficulty, context: AdContext): AnalysisRecord {
  const now = Date.now();
  return {
    id: nanoid(8),
    createdAt: now,
    updatedAt: now,
    difficulty,
    context,
    messages: [],
    answers: [],
    currentStep: null,
    finished: false,
  };
}

export function useAnalysis() {
  const [record, setRecord] = useState<AnalysisRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [starting, setStarting] = useState(false); // 初回呼び出し専用ローディング
  const [error, setError] = useState<string | null>(null);
  const recordRef = useRef(record);
  useEffect(() => { recordRef.current = record; }, [record]);

  const persist = useCallback((r: AnalysisRecord) => {
    save(r);
    setRecord(r);
  }, []);

  // setRecord はここでは呼ばず、初回返答が来てから画面を切り替える
  const start = useCallback(async (difficulty: Difficulty, context: AdContext) => {
    setError(null);
    setStarting(true);
    const r = newRecord(difficulty, context);
    try {
      const reply = await complete(buildInitialPrompt(context, difficulty));
      const msg: ChatMessage = { id: nanoid(6), role: "assistant", content: reply, createdAt: Date.now() };
      persist({ ...r, messages: [msg] });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setStarting(false);
    }
  }, [persist]);

  const loadExisting = useCallback((r: AnalysisRecord) => {
    setRecord(r);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const cur = recordRef.current;
    if (!cur || !text.trim()) return;
    setError(null);
    setBusy(true);

    const userMsg: ChatMessage = {
      id: nanoid(6),
      role: "user",
      content: text.trim(),
      step: cur.currentStep ?? undefined,
      createdAt: Date.now(),
    };

    const trimmed = text.trim();
    const triggerStart = !cur.currentStep && /分析開始|^はい|スタート|start/i.test(trimmed);
    const stepToProcess: StepId | null = cur.currentStep ?? (triggerStart ? 1 : null);

    const withUser: AnalysisRecord = {
      ...cur,
      messages: [...cur.messages, userMsg],
      currentStep: stepToProcess,
    };
    setRecord(withUser);

    try {
      let reply: string;
      if (stepToProcess) {
        reply = await complete(
          buildStepPrompt(stepToProcess, cur.difficulty, cur.context, withUser.messages, trimmed)
        );
      } else {
        reply = await complete(buildInitialPrompt(cur.context, cur.difficulty));
      }
      const aiMsg: ChatMessage = {
        id: nanoid(6),
        role: "assistant",
        content: reply,
        step: stepToProcess ?? undefined,
        createdAt: Date.now(),
      };

      const next: AnalysisRecord = { ...withUser, messages: [...withUser.messages, aiMsg] };

      if (stepToProcess) {
        const existingIdx = next.answers.findIndex(a => a.step === stepToProcess);
        const answer = { step: stepToProcess, userText: trimmed, feedback: reply };
        if (existingIdx >= 0) next.answers[existingIdx] = answer;
        else next.answers.push(answer);
      }

      persist(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }, [persist]);

  const finish = useCallback(async () => {
    const cur = recordRef.current;
    if (!cur) return;
    setBusy(true);
    setError(null);
    try {
      const score = await computeScore(cur);
      persist({ ...cur, finished: true, score });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }, [persist]);

  const advanceStep = useCallback(async () => {
    const cur = recordRef.current;
    if (!cur || !cur.currentStep) return;
    if (cur.currentStep >= 5) {
      await finish();
      return;
    }
    const nextStep = (cur.currentStep + 1) as StepId;
    const sysMsg: ChatMessage = {
      id: nanoid(6),
      role: "system",
      content: `STEP ${nextStep} に進みました`,
      step: nextStep,
      createdAt: Date.now(),
    };
    persist({ ...cur, currentStep: nextStep, messages: [...cur.messages, sysMsg] });
  }, [persist, finish]);

  const reset = useCallback(() => {
    setRecord(null);
    setError(null);
    setStarting(false);
  }, []);

  return { record, busy, starting, error, start, sendMessage, advanceStep, finish, reset, loadExisting };
}
