"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, ChevronLeft, ChevronRight, User } from "lucide-react"
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// 🚨 UPDATED: Define a specific Patient interface for appointments
interface Patient {
  //_id: string
  id: string
  name: string
  contact: string
  appointment_date: string
  time: string
  gender: string
}

interface CalendarViewProps {
  patients: Patient[]
  onPatientClick: (id: string) => void
}

export function CalendarView({ patients, onPatientClick }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    if (patients.length > 0) {
      const earliestAppointment = [...patients].sort(
        (a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
      )[0]

      if (earliestAppointment && new Date(earliestAppointment.appointment_date) > new Date()) {
        setCurrentMonth(new Date(earliestAppointment.appointment_date))
      }
    }
  }, [patients])

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const getPatientsForDay = (day: Date) => {
    return patients.filter((patient) => {
      return isSameDay(new Date(patient.appointment_date), day)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sky-700">
          <CalendarIcon className="h-5 w-5" />
          <h2 className="text-xl font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-2 font-medium border-b bg-sky-50 text-sky-800">
                {day}
              </div>
            ))}

            {days.map((day, i) => {
              const dayPatients = getPatientsForDay(day)
              const isCurrentMonth = isSameMonth(day, currentMonth)

              return (
                <div
                  key={i}
                  className={`min-h-[120px] p-2 border-b border-r ${
                    !isCurrentMonth ? "bg-slate-50 text-slate-400" : ""
                  } ${i % 7 === 6 ? "border-r-0" : ""}`}
                >
                  <div className="font-medium text-sm">{format(day, "d")}</div>
                  <div className="mt-1 space-y-1">
                    {dayPatients.map((patient) => (
                      <div
                        key={patient.id}
                        onClick={() => onPatientClick(patient.id)}
                        className={`text-xs p-1 rounded truncate cursor-pointer bg-sky-100 text-sky-800 hover:bg-sky-200`}
                        title={`${patient.name} - ${patient.time}`}
                      >
                        {patient.time} - {patient.name}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Upcoming Appointments</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {patients
            .filter((patient) => new Date(patient.appointment_date) > new Date())
            .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
            .slice(0, 3)
            .map((patient) => (
              <Card
                key={patient.id}
                className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-sky-500"
                onClick={() => onPatientClick(patient.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{patient.name}</CardTitle>
                    <Badge variant="secondary">{patient.gender}</Badge>
                  </div>
                  <CardDescription>{patient.contact}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      {format(new Date(patient.appointment_date), "MMMM d, yyyy")} at {patient.time}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  )
}