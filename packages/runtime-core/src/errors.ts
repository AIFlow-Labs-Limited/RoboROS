export class RoboRosError extends Error {
  constructor(message: string, readonly code = "ROBOROS_ERROR") {
    super(message);
    this.name = "RoboRosError";
  }
}

export class UnsupportedTransportError extends RoboRosError {
  constructor(mode: string) {
    super(
      `Transport "${mode}" is not implemented in this build. Start with rosbridge and add the adapter in a later milestone.`,
      "UNSUPPORTED_TRANSPORT",
    );
    this.name = "UnsupportedTransportError";
  }
}

export class TransportNotConnectedError extends RoboRosError {
  constructor() {
    super("RoboROS transport is not connected.", "TRANSPORT_NOT_CONNECTED");
    this.name = "TransportNotConnectedError";
  }
}

export class SafetyViolationError extends RoboRosError {
  constructor(message: string) {
    super(message, "SAFETY_VIOLATION");
    this.name = "SafetyViolationError";
  }
}

