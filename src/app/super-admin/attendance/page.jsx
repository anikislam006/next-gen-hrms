import { Suspense } from 'react'
import AttendancePage from './AttendancePage'

export default function AttendanceMainPage() {
  return (
    <Suspense fallback={<div>Loading Attendance...</div>}>
      <AttendancePage></AttendancePage>
    </Suspense>
  )
}