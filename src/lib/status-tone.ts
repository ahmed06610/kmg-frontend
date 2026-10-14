type Tone = "success" | "warning" | "error" | "info" | "neutral";

export function projectStatusTone(status: string): Tone {
  switch (status) {
    case "Completed":
      return "success";
    case "Closed":
      return "neutral";
    case "New":
      return "info";
    default:
      return "warning";
  }
}

export function missionStatusTone(status: string): Tone {
  return status === "Settled" ? "success" : "warning";
}

export function advanceStatusTone(status: string): Tone {
  return status === "Settled" ? "success" : "info";
}
