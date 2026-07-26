import { getNeighbors } from "./worddb";
import { normalizeInput } from "./word-input";

function bfsPath(start: string, end: string): string[] | null {
  if (start === end) return [start];

  const queue: string[] = [start];
  const visited = new Set<string>([start]);
  const previous = new Map<string, string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const neighbor of getNeighbors(current)) {
      if (visited.has(neighbor)) continue;
      visited.add(neighbor);
      previous.set(neighbor, current);

      if (neighbor === end) {
        const path = [end];
        let node: string | undefined = end;
        while (node && node !== start) {
          node = previous.get(node);
          if (node) path.unshift(node);
        }
        return path;
      }

      queue.push(neighbor);
    }
  }

  return null;
}

export function getShortestPath(
  startWord: string,
  endWord: string,
): string[] | null {
  const start = normalizeInput(startWord);
  const end = normalizeInput(endWord);
  return bfsPath(start, end);
}

export function getShortestPathLength(startWord: string, endWord: string): number | null {
  const path = getShortestPath(startWord, endWord);
  if (!path) return null;
  return path.length - 1;
}

export interface MoveHint {
  position: number;
}

export function getNextMoveHint(
  currentWord: string,
  endWord: string,
): MoveHint | null {
  const current = normalizeInput(currentWord);
  const end = normalizeInput(endWord);
  const path = bfsPath(current, end);

  if (!path || path.length < 2) return null;

  const next = path[1];
  for (let i = 0; i < current.length; i++) {
    if (current[i] !== next[i]) {
      return { position: i + 1 };
    }
  }

  return null;
}

export function isReachable(startWord: string, endWord: string): boolean {
  const start = normalizeInput(startWord);
  const end = normalizeInput(endWord);
  return bfsPath(start, end) !== null;
}
