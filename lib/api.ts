import ts from "typescript";
import NodeQuery from "@xinminlabs/node-query";

import type { Location, Range } from "./types";
import { SyntaxError } from "./error";

export const generateAst = (source: string, path: string = "code.ts"): ts.Node => {
  const node = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, false);
  const program = ts.createProgram([path], {});
  const diagnotics = program.getSyntacticDiagnostics(node);
  if (diagnotics.length > 0) {
    throw new SyntaxError(diagnotics[0].messageText.toString());
  }
  return node
}

export const parseNql = (nql: string, source: string, path: string = "code.ts"): Range[] => {
  const node = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true);
  const nodeQuery = new NodeQuery<ts.Node>(nql);
  const matchingNodes = nodeQuery.parse(node);
  return matchingNodes.map((matchingNode) => {
    return { start: parseStartLocation(matchingNode), end: parseEndLocation(matchingNode) };
  });
}

const parseStartLocation = (node: ts.Node): Location => {
  const { line, character } = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart());
  return { line: line + 1, column: character + 1 };
}

const parseEndLocation = (node: ts.Node): Location => {
  const { line, character } = node.getSourceFile().getLineAndCharacterOfPosition(node.getEnd());
  return { line: line + 1, column: character + 1 };
}