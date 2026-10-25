const PARTICIPANT_ID_KEY = "yt_user_id"

export function getParticipantId(): string {
  const storedId = sessionStorage.getItem(PARTICIPANT_ID_KEY)

  if (storedId) {
    return storedId
  }

  const participantId = crypto.randomUUID()
  sessionStorage.setItem(PARTICIPANT_ID_KEY, participantId)
  return participantId
}
