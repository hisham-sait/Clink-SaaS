import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface Meeting {
  date: string;
  type: 'AGM' | 'EGM' | 'Board Meeting';
  location: string;
  startTime: string;
  endTime: string;
  attendees: string;
  agenda: string;
  resolutions: string;
  minutes: string;
  chairperson: string;
  quorum: string;
  resolutionNumbers: string;
  nextMeetingDate?: string;
}

@Component({
  selector: 'app-meetings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './meetings.component.html',
  styleUrls: ['./meetings.component.scss']
})
export class MeetingsComponent implements OnInit {
  meetingForm: FormGroup;
  meetings: Meeting[] = [];

  meetingTypes = [
    'AGM',
    'EGM',
    'Board Meeting'
  ];

  constructor(private fb: FormBuilder) {
    this.meetingForm = this.fb.group({
      date: ['', Validators.required],
      type: ['', Validators.required],
      location: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      attendees: ['', Validators.required],
      agenda: ['', Validators.required],
      resolutions: ['', Validators.required],
      minutes: ['', Validators.required],
      chairperson: ['', Validators.required],
      quorum: ['', Validators.required],
      resolutionNumbers: ['', Validators.required],
      nextMeetingDate: ['']
    });
  }

  ngOnInit(): void {
    const savedMeetings = localStorage.getItem('meetings');
    if (savedMeetings) {
      this.meetings = JSON.parse(savedMeetings);
    }
  }

  onSubmit(): void {
    if (this.meetingForm.valid) {
      this.meetings.push(this.meetingForm.value);
      this.meetingForm.reset();
      localStorage.setItem('meetings', JSON.stringify(this.meetings));
    }
  }

  removeMeeting(index: number): void {
    this.meetings.splice(index, 1);
    localStorage.setItem('meetings', JSON.stringify(this.meetings));
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB');
  }

  formatTime(time: string): string {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDuration(startTime: string, endTime: string): string {
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  }

  downloadMinutes(meeting: Meeting): void {
    const content = `
Meeting Minutes
--------------
Date: ${this.formatDate(meeting.date)}
Type: ${meeting.type}
Location: ${meeting.location}
Time: ${this.formatTime(meeting.startTime)} - ${this.formatTime(meeting.endTime)}
Duration: ${this.getDuration(meeting.startTime, meeting.endTime)}
Chairperson: ${meeting.chairperson}
Quorum: ${meeting.quorum}

Attendees:
${meeting.attendees}

Agenda:
${meeting.agenda}

Resolutions:
${meeting.resolutions}
Resolution Numbers: ${meeting.resolutionNumbers}

Minutes:
${meeting.minutes}

${meeting.nextMeetingDate ? `Next Meeting Date: ${this.formatDate(meeting.nextMeetingDate)}` : ''}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minutes_${meeting.date}_${meeting.type.toLowerCase().replace(' ', '_')}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
