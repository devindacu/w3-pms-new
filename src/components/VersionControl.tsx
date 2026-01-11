import { BackupManagement } from './BackupManagement'
import type { SystemUser } from '@/lib/types'

interface VersionControlProps {
  currentUser: SystemUser
}

export function VersionControl({ currentUser }: VersionControlProps) {
  return <BackupManagement currentUser={currentUser} />
}
