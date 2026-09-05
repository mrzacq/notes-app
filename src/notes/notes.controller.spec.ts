import { Test, TestingModule } from '@nestjs/testing';
import { NotesController } from './notes.controller.js';
import { NotesService } from './notes.service.js';

describe('NotesController', () => {
  let controller: NotesController;
  let service: NotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [NotesService],
    }).compile();

    controller = module.get<NotesController>(NotesController);
    service = module.get<NotesService>(NotesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a note', () => {
    const note = controller.create({ title: 'Title', content: 'Content' });

    expect(note.title).toBe('Title');
  });

  it('should return all notes', () => {
    controller.create({ title: 'Title', content: 'Content' });

    expect(controller.findAll()).toHaveLength(1);
  });

  it('should return a single note', () => {
    const created = controller.create({ title: 'Title', content: 'Content' });

    expect(controller.findOne(created.id)).toEqual(created);
  });

  it('should update a note', () => {
    const created = controller.create({ title: 'Title', content: 'Content' });

    const updated = controller.update(created.id, { title: 'Updated' });

    expect(updated.title).toBe('Updated');
  });

  it('should remove a note', () => {
    const created = controller.create({ title: 'Title', content: 'Content' });

    controller.remove(created.id);

    expect(service.findAll()).toHaveLength(0);
  });
});
