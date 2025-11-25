import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Users,
  Calendar,
  ClipboardText,
  ChartBar,
  Plus,
  UserCircle,
  Clock,
  CalendarCheck,
  Star,
  Briefcase
} from '@phosphor-icons/react'
import { type Employee, type Attendance, type LeaveRequest, type Shift, type DutyRoster, type PerformanceReview } from '@/lib/types'
import { EmployeeDialog } from '@/components/EmployeeDialog'
import { AttendanceDialog } from '@/components/AttendanceDialog'
import { LeaveRequestDialog } from '@/components/LeaveRequestDialog'
import { ShiftDialog } from '@/components/ShiftDialog'
import { DutyRosterDialog } from '@/components/DutyRosterDialog'
import { PerformanceReviewDialog } from '@/components/PerformanceReviewDialog'

interface HRManagementProps {
  employees: Employee[]
  setEmployees: (employees: Employee[]) => void
  attendance: Attendance[]
  setAttendance: (attendance: Attendance[]) => void
  leaveRequests: LeaveRequest[]
  setLeaveRequests: (requests: LeaveRequest[]) => void
  shifts: Shift[]
  setShifts: (shifts: Shift[]) => void
  dutyRosters: DutyRoster[]
  setDutyRosters: (rosters: DutyRoster[]) => void
  performanceReviews: PerformanceReview[]
  setPerformanceReviews: (reviews: PerformanceReview[]) => void
}

export function HRManagement({
  employees,
  setEmployees,
  attendance,
  setAttendance,
  leaveRequests,
  setLeaveRequests,
  shifts,
  setShifts,
  dutyRosters,
  setDutyRosters,
  performanceReviews,
  setPerformanceReviews
}: HRManagementProps) {
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false)
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false)
  const [rosterDialogOpen, setRosterDialogOpen] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null)
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null)
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
  const [selectedRoster, setSelectedRoster] = useState<DutyRoster | null>(null)
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null)

  const activeEmployees = employees.filter(emp => emp.status === 'active')
  const pendingLeaves = leaveRequests.filter(req => req.status === 'pending')
  const todayRosters = dutyRosters.filter(roster => {
    const today = new Date().setHours(0, 0, 0, 0)
    const rosterDate = new Date(roster.date).setHours(0, 0, 0, 0)
    return rosterDate === today
  })

  const getEmployeeName = (employeeId: string) => {
    const emp = employees.find(e => e.id === employeeId)
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown'
  }

  const getShiftDetails = (shiftId: string) => {
    return shifts.find(s => s.id === shiftId)
  }

  const getDepartmentColor = (dept: string) => {
    const colors: Record<string, string> = {
      'front-office': 'bg-primary/10 text-primary',
      'housekeeping': 'bg-accent/10 text-accent',
      'fnb': 'bg-success/10 text-success',
      'kitchen': 'bg-success/10 text-success',
      'engineering': 'bg-muted text-muted-foreground',
      'finance': 'bg-primary/10 text-primary',
      'hr': 'bg-secondary text-secondary-foreground',
      'admin': 'bg-muted text-muted-foreground'
    }
    return colors[dept] || 'bg-muted text-muted-foreground'
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'active': 'default',
      'on-leave': 'secondary',
      'terminated': 'destructive',
      'pending': 'outline',
      'approved': 'default',
      'rejected': 'destructive',
      'scheduled': 'default',
      'completed': 'secondary',
      'missed': 'destructive',
      'draft': 'outline',
      'submitted': 'default',
      'acknowledged': 'secondary'
    }
    return variants[status] || 'outline'
  }

  const handleEditEmployee = (emp: Employee) => {
    setSelectedEmployee(emp)
    setEmployeeDialogOpen(true)
  }

  const handleEditLeave = (leave: LeaveRequest) => {
    setSelectedLeave(leave)
    setLeaveDialogOpen(true)
  }

  const handleEditShift = (shift: Shift) => {
    setSelectedShift(shift)
    setShiftDialogOpen(true)
  }

  const handleEditRoster = (roster: DutyRoster) => {
    setSelectedRoster(roster)
    setRosterDialogOpen(true)
  }

  const handleEditReview = (review: PerformanceReview) => {
    setSelectedReview(review)
    setReviewDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">HR & Staff Management</h1>
          <p className="text-muted-foreground mt-1">Manage employees, attendance, shifts, and performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Active Staff</h3>
            <Users size={20} className="text-primary" />
          </div>
          <p className="text-3xl font-semibold">{activeEmployees.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Total employees</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">On Duty Today</h3>
            <Calendar size={20} className="text-accent" />
          </div>
          <p className="text-3xl font-semibold">{todayRosters.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Scheduled shifts</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-destructive">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Pending Leaves</h3>
            <ClipboardText size={20} className="text-destructive" />
          </div>
          <p className="text-3xl font-semibold">{pendingLeaves.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Awaiting approval</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Reviews</h3>
            <Star size={20} className="text-success" />
          </div>
          <p className="text-3xl font-semibold">{performanceReviews.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Total reviews</p>
        </Card>
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="employees">Staff Profiles</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leaves">Leave Management</TabsTrigger>
          <TabsTrigger value="shifts">Shifts</TabsTrigger>
          <TabsTrigger value="rosters">Duty Rosters</TabsTrigger>
          <TabsTrigger value="reviews">Performance Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Staff Profiles</h2>
            <Button onClick={() => { setSelectedEmployee(null); setEmployeeDialogOpen(true) }}>
              <Plus size={18} className="mr-2" />
              Add Employee
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((emp) => (
              <Card key={emp.id} className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleEditEmployee(emp)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCircle size={32} className="text-primary" weight="fill" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{emp.firstName} {emp.lastName}</h3>
                      <p className="text-sm text-muted-foreground">{emp.employeeId}</p>
                    </div>
                  </div>
                  <Badge variant={getStatusBadge(emp.status)}>{emp.status}</Badge>
                </div>
                <Separator className="my-3" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department:</span>
                    <Badge variant="outline" className={getDepartmentColor(emp.department)}>{emp.department}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role:</span>
                    <span className="font-medium capitalize">{emp.role.replace('-', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="text-xs">{emp.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="text-xs">{emp.phone}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Attendance Tracking</h2>
            <Button onClick={() => { setSelectedAttendance(null); setAttendanceDialogOpen(true) }}>
              <Plus size={18} className="mr-2" />
              Mark Attendance
            </Button>
          </div>

          <Card>
            <div className="p-6">
              <div className="space-y-4">
                {attendance.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No attendance records found</p>
                ) : (
                  attendance.map((att) => (
                    <div key={att.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <Clock size={24} className="text-muted-foreground" />
                        <div>
                          <p className="font-medium">{getEmployeeName(att.employeeId)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(att.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {att.checkIn && (
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Check In</p>
                            <p className="font-medium">{new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        )}
                        {att.checkOut && (
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Check Out</p>
                            <p className="font-medium">{new Date(att.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        )}
                        <Badge variant={getStatusBadge(att.status)}>{att.status}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="leaves" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Leave Management</h2>
            <Button onClick={() => { setSelectedLeave(null); setLeaveDialogOpen(true) }}>
              <Plus size={18} className="mr-2" />
              New Leave Request
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {leaveRequests.length === 0 ? (
              <Card className="p-8">
                <p className="text-center text-muted-foreground">No leave requests found</p>
              </Card>
            ) : (
              leaveRequests.map((leave) => (
                <Card key={leave.id} className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleEditLeave(leave)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{getEmployeeName(leave.employeeId)}</h3>
                        <Badge variant={getStatusBadge(leave.status)}>{leave.status}</Badge>
                        <Badge variant="outline">{leave.leaveType}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Start Date</p>
                          <p className="font-medium">{new Date(leave.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">End Date</p>
                          <p className="font-medium">{new Date(leave.endDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Days</p>
                          <p className="font-medium">{leave.days} day{leave.days !== 1 ? 's' : ''}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Reason</p>
                          <p className="font-medium">{leave.reason}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="shifts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Shift Management</h2>
            <Button onClick={() => { setSelectedShift(null); setShiftDialogOpen(true) }}>
              <Plus size={18} className="mr-2" />
              Define Shift
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts.map((shift) => (
              <Card key={shift.id} className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleEditShift(shift)}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg capitalize">{shift.shiftType} Shift</h3>
                    <Badge variant="outline" className={getDepartmentColor(shift.department)}>{shift.department}</Badge>
                  </div>
                  <Briefcase size={24} className="text-primary" />
                </div>
                <Separator className="my-3" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium">{shift.startTime} - {shift.endTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Required Staff:</span>
                    <span className="font-medium">{shift.requiredStaff}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Break:</span>
                    <span className="font-medium">{shift.breakDuration} min</span>
                  </div>
                  {shift.description && (
                    <p className="text-xs text-muted-foreground mt-2">{shift.description}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rosters" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Duty Rosters</h2>
            <Button onClick={() => { setSelectedRoster(null); setRosterDialogOpen(true) }}>
              <Plus size={18} className="mr-2" />
              Assign Duty
            </Button>
          </div>

          <Card>
            <div className="p-6">
              <div className="space-y-4">
                {dutyRosters.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No duty rosters found</p>
                ) : (
                  dutyRosters.map((roster) => {
                    const shift = getShiftDetails(roster.shiftId)
                    return (
                      <div key={roster.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => handleEditRoster(roster)}>
                        <div className="flex items-center gap-4">
                          <CalendarCheck size={24} className="text-primary" />
                          <div>
                            <p className="font-medium">{getEmployeeName(roster.employeeId)}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(roster.date).toLocaleDateString()} • {shift?.shiftType || 'Unknown'} shift
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className={getDepartmentColor(roster.department)}>
                            {roster.department}
                          </Badge>
                          {shift && (
                            <span className="text-sm text-muted-foreground">
                              {shift.startTime} - {shift.endTime}
                            </span>
                          )}
                          <Badge variant={getStatusBadge(roster.status)}>{roster.status}</Badge>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Performance Reviews</h2>
            <Button onClick={() => { setSelectedReview(null); setReviewDialogOpen(true) }}>
              <Plus size={18} className="mr-2" />
              New Review
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {performanceReviews.length === 0 ? (
              <Card className="p-8">
                <p className="text-center text-muted-foreground">No performance reviews found</p>
              </Card>
            ) : (
              performanceReviews.map((review) => (
                <Card key={review.id} className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleEditReview(review)}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                        <Star size={24} className="text-success" weight="fill" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{getEmployeeName(review.employeeId)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(review.reviewPeriodStart).toLocaleDateString()} - {new Date(review.reviewPeriodEnd).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-2xl font-semibold text-success">{review.overallRating.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">Overall</p>
                      </div>
                      <Badge variant={getStatusBadge(review.status)}>{review.status}</Badge>
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="grid grid-cols-5 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold">{review.punctuality}</p>
                      <p className="text-xs text-muted-foreground">Punctuality</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{review.qualityOfWork}</p>
                      <p className="text-xs text-muted-foreground">Quality</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{review.teamwork}</p>
                      <p className="text-xs text-muted-foreground">Teamwork</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{review.communication}</p>
                      <p className="text-xs text-muted-foreground">Communication</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{review.initiative}</p>
                      <p className="text-xs text-muted-foreground">Initiative</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div>
                      <p className="font-medium">Strengths:</p>
                      <p className="text-muted-foreground">{review.strengths}</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <EmployeeDialog
        open={employeeDialogOpen}
        onOpenChange={setEmployeeDialogOpen}
        employee={selectedEmployee}
        employees={employees}
        setEmployees={setEmployees}
      />

      <AttendanceDialog
        open={attendanceDialogOpen}
        onOpenChange={setAttendanceDialogOpen}
        attendance={selectedAttendance}
        employees={employees}
        attendanceRecords={attendance}
        setAttendance={setAttendance}
      />

      <LeaveRequestDialog
        open={leaveDialogOpen}
        onOpenChange={setLeaveDialogOpen}
        leaveRequest={selectedLeave}
        employees={employees}
        leaveRequests={leaveRequests}
        setLeaveRequests={setLeaveRequests}
      />

      <ShiftDialog
        open={shiftDialogOpen}
        onOpenChange={setShiftDialogOpen}
        shift={selectedShift}
        shifts={shifts}
        setShifts={setShifts}
      />

      <DutyRosterDialog
        open={rosterDialogOpen}
        onOpenChange={setRosterDialogOpen}
        roster={selectedRoster}
        employees={employees}
        shifts={shifts}
        rosters={dutyRosters}
        setRosters={setDutyRosters}
      />

      <PerformanceReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        review={selectedReview}
        employees={employees}
        reviews={performanceReviews}
        setReviews={setPerformanceReviews}
      />
    </div>
  )
}
