import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto.js';
import { UpdateNoteDto } from './dto/update-note.dto.js';
import { Note } from './entities/note.entity.js';

@Injectable()
export class NotesService {
  private notes: Note[] = [];
  private nextId = 1;

  create(createNoteDto: CreateNoteDto): Note {
    const now = new Date();
    const note: Note = {
      id: this.nextId++,
      title: createNoteDto.title,
      content: createNoteDto.content,
      createdAt: now,
      updatedAt: now,
    };
    this.notes.push(note);
    return note;
  }

  findAll(): Note[] {
    return this.notes;
  }

  findOne(id: number): Note {
    const note = this.notes.find((item) => item.id === id);
    if (!note) {
      throw new NotFoundException(`Note with id ${id} not found`);
    }
    return note;
  }

  update(id: number, updateNoteDto: UpdateNoteDto): Note {
    const note = this.findOne(id);
    Object.assign(note, updateNoteDto, { updatedAt: new Date() });
    return note;
  }

  remove(id: number): Note {
    const index = this.notes.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException(`Note with id ${id} not found`);
    }
    const [removed] = this.notes.splice(index, 1);
    return removed;
  }
}
