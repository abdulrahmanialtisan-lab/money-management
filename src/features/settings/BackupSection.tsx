import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, Upload } from 'lucide-react'
import { Pill } from '../../components/ui/Pill'
import { exportAllData, importAllData, downloadBackupFile } from '../../db/backup'
import { useUiStore } from '../../state/uiStore'

export function BackupSection() {
  const { t } = useTranslation()
  const showToast = useUiStore((s) => s.showToast)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  async function handleExport() {
    setBusy(true)
    try {
      const json = await exportAllData()
      downloadBackupFile(json)
      showToast(t('toast.exported'))
    } finally {
      setBusy(false)
    }
  }

  function handleImportClick() {
    if (!confirm(t('settings.importWarning'))) return
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      const text = await file.text()
      await importAllData(text)
      showToast(t('toast.imported'))
    } catch {
      showToast(t('toast.importFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2">
      <Pill variant="outline" className="w-full justify-start gap-3 px-4" onClick={handleExport} disabled={busy}>
        <Download size={16} />
        {t('settings.exportData')}
      </Pill>
      <Pill variant="outline" className="w-full justify-start gap-3 px-4" onClick={handleImportClick} disabled={busy}>
        <Upload size={16} />
        {t('settings.importData')}
      </Pill>
      <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileChange} />
    </div>
  )
}
