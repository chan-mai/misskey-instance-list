import * as v from 'valibot';

// h3のgetValidatedQuery等はstatusMessage固定
export const parseOrThrow = <TSchema extends v.GenericSchema>(
  schema: TSchema,
  input: unknown,
): v.InferOutput<TSchema> => {
  const result = v.safeParse(schema, input);
  if (result.success) return result.output;

  // 先頭issueのみ返す
  const issue = result.issues[0]!;
  throw createError({ statusCode: 400, statusMessage: describeIssue(issue) });
};

const describeIssue = (issue: v.BaseIssue<unknown>): string => {
  const path = v.getDotPath(issue);
  if (!path) return issue.message;

  // 必須キー欠落の既定文言変換
  if (issue.type === 'object' && issue.received === 'undefined') {
    return `${path} is required`;
  }

  return `${path}: ${issue.message}`;
};
