import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface BoardMeeting {
  date: string;
  location: string;
  startTime: string;
  endTime: string;
  attendees: string;
  apologies: string;
  agenda: string;
  discussions: string;
  decisions: string;
  actions: string;
  nextMeetingDate?: string;
  chairperson: string;
  quorum: string;
  resolutionNumbers: string;
}

@Component({
  selector: 'app-board-minutes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './board-minutes.component.html',
  styleUrls: ['./board-minutes.component.scss']
})
export class BoardMinutesComponent implements OnInit {
  meetingForm: FormGroup;
  meetings: BoardMeeting[] = [];

  constructor(private fb: FormBuilder) {
    this.meetingForm = this.fb.group({
      date: ['', Validators.required],
      location: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      attendees: ['', Validators.required],
      apologies: [''],
      agenda: ['', Validators.required],
      discussions: ['', Validators.required],
      decisions: ['', Validators.required],
      actions: ['', Validators.required],
      nextMeetingDate: [''],
      chairperson: ['', Validators.required],
      quorum: ['', Validators.required],
      resolutionNumbers: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const savedMeetings = localStorage.getItem('boardMeetings');
    if (savedMeetings) {
      this.meetings = JSON.parse(savedMeetings);
    }
  }

  onSubmit(): void {
    if (this.meetingForm.valid) {
      this.meetings.push(this.meetingForm.value);
      this.meetingForm.reset();
      localStorage.setItem('boardMeetings', JSON.stringify(this.meetings));
    }
  }

  removeMeeting(index: number): void {
    this.meetings.splice(index, 1);
    localStorage.setItem('boardMeetings', JSON.stringify(this.meetings));
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

  downloadMinutes(meeting: BoardMeeting): void {
    const content = `
Board Meeting Minutes
-------------------
Date: ${this.formatDate(meeting.date)}
Location: ${meeting.location}
Time: ${this.formatTime(meeting.startTime)} - ${this.formatTime(meeting.endTime)}
Duration: ${this.getDuration(meeting.startTime, meeting.endTime)}
Chairperson: ${meeting.chairperson}
Quorum: ${meeting.quorum}

Attendees:
${meeting.attendees}

Apologies:
${meeting.apologies || 'None'}

Agenda:
${meeting.agenda}

Discussions:
${meeting.discussions}

Decisions:
${meeting.decisions}

Actions:
${meeting.actions}

Resolution Numbers: ${meeting.resolutionNumbers}

${meeting.nextMeetingDate ? `Next Meeting Date: ${this.formatDate(meeting.nextMeetingDate)}` : ''}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `board_minutes_${meeting.date}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
