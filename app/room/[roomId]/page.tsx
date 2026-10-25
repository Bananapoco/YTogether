import { RoomClient } from "@/features/room/room-client"

interface PageProps {
  params: Promise<{
    roomId: string
  }>
}

export default async function RoomPage({ params }: PageProps) {
  const { roomId } = await params

  return <RoomClient roomId={roomId} />
}
