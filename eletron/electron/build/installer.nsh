; Hook NSIS electron-builder — dipanggil di awal .onInit (lihat installer.nsi).
; Electron menjalankan beberapa proses dengan nama exe yang sama; taskkill bawaan
; kadang tidak cukup sehingga muncul "cannot be closed". /F /T menutup pohon proses.

!macro preInit
  DetailPrint "Stopping ${PRODUCT_NAME} if running (taskkill /F /T)..."
  nsExec::ExecToLog `cmd /c taskkill /F /IM "${APP_EXECUTABLE_FILENAME}" /T`
  Pop $R9
  Sleep 1000
!macroend
