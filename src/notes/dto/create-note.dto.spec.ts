import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateNoteDto } from './create-note.dto.js';

describe('CreateNoteDto', () => {
  it('passes validation with valid data', async () => {
    const dto = plainToInstance(CreateNoteDto, {
      title: 'Title',
      content: 'Content',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('fails validation when title is empty', async () => {
    const dto = plainToInstance(CreateNoteDto, {
      title: '',
      content: 'Content',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'title')).toBe(true);
  });

  it('fails validation when content is empty', async () => {
    const dto = plainToInstance(CreateNoteDto, {
      title: 'Title',
      content: '',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'content')).toBe(true);
  });

  it('fails validation when fields are not strings', async () => {
    const dto = plainToInstance(CreateNoteDto, { title: 123, content: 456 });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});
