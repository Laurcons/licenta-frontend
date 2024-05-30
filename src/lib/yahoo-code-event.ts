export class YahooCodeEvent extends Event {
  constructor(public code: string) {
    super('x-yahoo-code');
  }
}
