import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { appointments, appointmentTypes } from "@/lib/schema";
import { eq, gte, and } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock, MapPin, Video, User, Settings } from "lucide-react";

export default async function CalendarPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppointments = await db.query.appointments.findMany({
    where: and(
      eq(appointments.userId, user.id),
      gte(appointments.startTime, today)
    ),
    orderBy: (appointments, { asc }) => [asc(appointments.startTime)],
    with: {
      client: true,
      appointmentType: true,
    },
    limit: 10,
  });

  const userAppointmentTypes = await db.query.appointmentTypes.findMany({
    where: eq(appointmentTypes.userId, user.id),
  });

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const getStatusVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
      scheduled: "secondary",
      confirmed: "default",
      completed: "success",
      cancelled: "destructive",
      no_show: "destructive",
    };
    return variants[status] || "secondary";
  };

  // Group appointments by date
  const groupedAppointments: Record<string, typeof upcomingAppointments> = {};
  upcomingAppointments.forEach((apt) => {
    const dateKey = apt.startTime.toDateString();
    if (!groupedAppointments[dateKey]) {
      groupedAppointments[dateKey] = [];
    }
    groupedAppointments[dateKey].push(apt);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500 mt-1">
            Schedule and manage your appointments
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/calendar/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/calendar/new">
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled meetings and sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(groupedAppointments).length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No upcoming appointments</h3>
                  <p className="text-gray-500 mt-1">
                    Your schedule is clear. Time to book some meetings!
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/dashboard/calendar/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Appointment
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedAppointments).map(([dateKey, apts]) => (
                    <div key={dateKey}>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        {formatDate(new Date(dateKey))}
                      </h3>
                      <div className="space-y-3">
                        {apts.map((apt) => (
                          <div
                            key={apt.id}
                            className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:border-amber-200 transition-colors"
                          >
                            <div
                              className="w-1 h-full rounded-full"
                              style={{
                                backgroundColor: apt.appointmentType?.color || "#f59e0b",
                              }}
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">
                                  {apt.title}
                                </h4>
                                <Badge variant={getStatusVariant(apt.status)}>
                                  {apt.status}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatTime(apt.startTime)} -{" "}
                                  {formatTime(apt.endTime)}
                                </span>
                                {apt.location && (
                                  <span className="flex items-center">
                                    {apt.meetingUrl ? (
                                      <Video className="h-3 w-3 mr-1" />
                                    ) : (
                                      <MapPin className="h-3 w-3 mr-1" />
                                    )}
                                    {apt.location}
                                  </span>
                                )}
                              </div>
                              {(apt.client || apt.clientName) && (
                                <div className="flex items-center mt-2 text-sm text-gray-500">
                                  <User className="h-3 w-3 mr-1" />
                                  {apt.client?.name || apt.clientName}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Appointment Types */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Types</CardTitle>
              <CardDescription>
                Configure your booking options
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userAppointmentTypes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 mb-4">
                    Create appointment types to let clients book with you
                  </p>
                  <Button size="sm" asChild>
                    <Link href="/dashboard/calendar/settings">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Type
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {userAppointmentTypes.map((type) => (
                    <div
                      key={type.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: type.color || "#f59e0b" }}
                        />
                        <div>
                          <p className="font-medium text-sm">{type.name}</p>
                          <p className="text-xs text-gray-500">
                            {type.duration} minutes
                          </p>
                        </div>
                      </div>
                      <Badge variant={type.isActive ? "success" : "secondary"}>
                        {type.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Link</CardTitle>
              <CardDescription>Share this link with clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 font-mono break-all">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/book/${user.id}`
                    : `/book/${user.id}`}
                </p>
              </div>
              <Button variant="outline" className="w-full mt-3" size="sm">
                Copy Link
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
