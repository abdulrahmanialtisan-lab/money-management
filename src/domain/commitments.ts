import type { Commitment, CommitmentSnapshot } from './types'

export interface CommitmentDeduction {
  totalCommitments: number
  breakdown: CommitmentSnapshot[]
  leftoverAfterCommitments: number
  isOverCommitted: boolean
}

export function computeCommitmentDeduction(
  commitments: Pick<Commitment, 'id' | 'name' | 'amount' | 'active'>[],
  salaryAmount: number,
): CommitmentDeduction {
  const active = commitments.filter((c) => c.active)
  const breakdown: CommitmentSnapshot[] = active.map((c) => ({
    commitmentId: c.id,
    name: c.name,
    amount: c.amount,
  }))
  const totalCommitments = active.reduce((sum, c) => sum + c.amount, 0)
  const rawLeftover = salaryAmount - totalCommitments

  return {
    totalCommitments,
    breakdown,
    leftoverAfterCommitments: Math.max(0, rawLeftover),
    isOverCommitted: rawLeftover < 0,
  }
}
