export interface JobResult<TInput, TOutput, TMeta> {
  input: TInput;
  output: TOutput;
  meta: TMeta;
}
