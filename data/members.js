export const MEMBERS = [];

export function getMemberById(id) {
  return MEMBERS.find((member) => member.id === id);
}

export function getMemberByAuthorName(authorName) {
  if (!authorName) return null;
  const name = authorName.replace(/\s*\(вы\)\s*$/, '').trim();
  return MEMBERS.find((member) => member.name === name) ?? null;
}

export function getMutualConnections(member, userConnectedIds) {
  if (!member?.connectionIds?.length || !userConnectedIds?.length) return [];
  return member.connectionIds
    .filter((id) => userConnectedIds.includes(id))
    .map(getMemberById)
    .filter(Boolean);
}
