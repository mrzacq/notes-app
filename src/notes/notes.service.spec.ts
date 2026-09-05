import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotesService } from './notes.service.js';

describe('NotesService', () => {
  let service: NotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotesService],
    }).compile();

    service = module.get<NotesService>(NotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a note', () => {
    const note = service.create({ title: 'Title', content: 'Content' });

    expect(note.id).toBe(1);
    expect(note.title).toBe('Title');
    expect(note.content).toBe('Content');
  });

  it('should list all notes', () => {
    service.create({ title: 'First', content: 'First content' });
    service.create({ title: 'Second', content: 'Second content' });

    expect(service.findAll()).toHaveLength(2);
  });

  it('should find a note by id', () => {
    const created = service.create({ title: 'Title', content: 'Content' });

    expect(service.findOne(created.id)).toEqual(created);
  });

  it('should throw NotFoundException when note is missing', () => {
    expect(() => service.findOne(999)).toThrow(NotFoundException);
  });

  it('should update a note', () => {
    const created = service.create({ title: 'Title', content: 'Content' });

    const updated = service.update(created.id, { title: 'Updated' });

    expect(updated.title).toBe('Updated');
    expect(updated.content).toBe('Content');
  });

  it('should remove a note', () => {
    const created = service.create({ title: 'Title', content: 'Content' });

    const removed = service.remove(created.id);

    expect(removed.id).toBe(created.id);
    expect(service.findAll()).toHaveLength(0);
  });

  it('should throw NotFoundException when removing a missing note', () => {
    expect(() => service.remove(999)).toThrow(NotFoundException);
  });
});
