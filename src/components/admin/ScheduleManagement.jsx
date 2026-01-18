'use client';

import { useEffect, useState } from 'react';
import { getSchedules, createSchedule, updateSchedule, deleteSchedule } from '@/src/lib/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ScheduleManagement() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    maxPlayers: '',
    fee: ''
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const data = await getSchedules();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date || !formData.time) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await createSchedule({
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date),
        time: formData.time,
        location: formData.location,
        maxPlayers: formData.maxPlayers ? parseInt(formData.maxPlayers) : null,
        fee: formData.fee ? parseFloat(formData.fee) : null
      });

      toast.success('Schedule created successfully');
      setDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        maxPlayers: '',
        fee: ''
      });
      fetchSchedules();
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast.error('Failed to create schedule');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    try {
      await deleteSchedule(id);
      toast.success('Schedule deleted successfully');
      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Failed to delete schedule');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Schedule Management</CardTitle>
            <CardDescription>Create and manage weekly play schedules</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Schedule</DialogTitle>
                <DialogDescription>
                  Add a new play session to the schedule
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Wednesday Evening Session"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Session details"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Venue"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxPlayers">Max Players</Label>
                    <Input
                      id="maxPlayers"
                      type="number"
                      min="0"
                      value={formData.maxPlayers}
                      onChange={(e) => setFormData({...formData, maxPlayers: e.target.value})}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fee">Fee (₹)</Label>
                    <Input
                      id="fee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.fee}
                      onChange={(e) => setFormData({...formData, fee: e.target.value})}
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">Create Schedule</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading schedules...</div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No schedules yet. Click "Add Schedule" to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Max Players</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => {
                  const scheduleDate = schedule.date?.toDate ? schedule.date.toDate() : new Date(schedule.date);
                  
                  return (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.title}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(scheduleDate, 'PPP')}</div>
                          <div className="text-muted-foreground">{schedule.time}</div>
                        </div>
                      </TableCell>
                      <TableCell>{schedule.location || '-'}</TableCell>
                      <TableCell>{schedule.maxPlayers || '∞'}</TableCell>
                      <TableCell>{schedule.fee ? `₹${schedule.fee}` : 'Free'}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(schedule.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}