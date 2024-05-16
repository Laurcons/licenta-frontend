export class TicketUtil {
  static decodeQrCode(rawCode: string) {
    const regex =
      /^(?<serial>[A-Z]{4}[0-9]{4})[0-9]{5}(?<emitter>[0-9]{5})(?<depart>[0-9]{5})(?<arrive>[0-9]{5})[0-9]{5}(?<discount>[0-9]{7})[0-9](?<trainNum>[0-9]{4})(?<trainNumSuffix>[0-9])$/;
    const code = rawCode.replace(/Q/g, '0');
    const match = regex.exec(code);
    console.log({ match, code });
    if (!match)
      throw new Error(
        "Cannot decode QR code. Make sure it's a valid CFR ticket QR code."
      );
    const trainNum = parseInt(match.groups!.trainNum).toString();
    const destinationId = parseInt(match.groups!.arrive).toString();
    const departureId = parseInt(match.groups!.depart).toString();
    const emitterId = parseInt(match.groups!.emitter).toString();
    const serial = match.groups!.serial;
    const trainNumSuffix = match.groups!.trainNumSuffix;
    return {
      trainNum,
      destinationId,
      departureId,
      emitterId,
      serial,
      trainNumSuffix,
    };
  }
}
