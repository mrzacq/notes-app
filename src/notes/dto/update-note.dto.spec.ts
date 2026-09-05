import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateNoteDto } from './update-note.dto.js';

describe('UpdateNoteDto', () => {
  it('passes validation with an empty payload since all fields are optional', async () => {
    const dto = plainToInstance(UpdateNoteDto, {});

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('passes validation with a partial payload', async () => {
    const dto = plainToInstance(UpdateNoteDto, { title: 'Title' });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('fails validation when a provided field is empty', async () => {
    const dto = plainToInstance(UpdateNoteDto, { title: '' });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'title')).toBe(true);
  });
});
