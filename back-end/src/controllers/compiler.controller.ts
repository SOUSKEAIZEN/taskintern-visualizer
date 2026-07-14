import { Request, Response } from "express";
import { executeCode } from "../services/compiler.service";
import { judgeSubmission } from "../services/judge.service";

export const runCode = async (req: Request, res: Response) => {
  try {
    const { language, code, stdin } = req.body;
    if (!language || !code) {
      return res.status(400).json({ status: "Error", stderr: "Missing language or code" });
    }
    const result = await executeCode(language, code, stdin || "");
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ status: "Runtime Error", stderr: error.message });
  }
};

export const submitCode = async (req: Request, res: Response) => {
  try {
    const { language, code, questionId } = req.body;
    if (!language || !code || !questionId) {
      return res.status(400).json({ status: "Error", stderr: "Missing language, code, or questionId" });
    }
    const result = await judgeSubmission(language, code, questionId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ status: "Error", stderr: error.message });
  }
};
