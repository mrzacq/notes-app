import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';

describe('Notes (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/notes (POST) creates a note', async () => {
    const res = await request(app.getHttpServer())
      .post('/notes')
      .send({ title: 'Title', content: 'Content' })
      .expect(201);

    expect(res.body).toMatchObject({ title: 'Title', content: 'Content' });
    expect(res.body.id).toBeDefined();
  });

  it('/notes (POST) rejects an invalid body', () => {
    return request(app.getHttpServer())
      .post('/notes')
      .send({ title: '' })
      .expect(400);
  });

  it('/notes (POST) strips unknown properties', async () => {
    const res = await request(app.getHttpServer())
      .post('/notes')
      .send({ title: 'Title', content: 'Content', extra: 'nope' })
      .expect(201);

    expect(res.body.extra).toBeUndefined();
  });

  it('/notes (GET) returns the list of notes', async () => {
    await request(app.getHttpServer())
      .post('/notes')
      .send({ title: 'Title', content: 'Content' });

    const res = await request(app.getHttpServer()).get('/notes').expect(200);

    expect(res.body).toHaveLength(1);
  });

  it('/notes/:id (GET) returns a single note', async () => {
    const created = await request(app.getHttpServer())
      .post('/notes')
      .send({ title: 'Title', content: 'Content' });

    const res = await request(app.getHttpServer())
      .get(`/notes/${created.body.id}`)
      .expect(200);

    expect(res.body.id).toBe(created.body.id);
  });

  it('/notes/:id (GET) returns 404 when the note does not exist', () => {
    return request(app.getHttpServer()).get('/notes/999').expect(404);
  });

  it('/notes/:id (GET) returns 400 for a non-numeric id', () => {
    return request(app.getHttpServer()).get('/notes/abc').expect(400);
  });

  it('/notes/:id (PATCH) updates a note', async () => {
    const created = await request(app.getHttpServer())
      .post('/notes')
      .send({ title: 'Title', content: 'Content' });

    const res = await request(app.getHttpServer())
      .patch(`/notes/${created.body.id}`)
      .send({ title: 'Updated' })
      .expect(200);

    expect(res.body.title).toBe('Updated');
    expect(res.body.content).toBe('Content');
  });

  it('/notes/:id (PATCH) returns 404 when the note does not exist', () => {
    return request(app.getHttpServer())
      .patch('/notes/999')
      .send({ title: 'Updated' })
      .expect(404);
  });

  it('/notes/:id (DELETE) removes a note', async () => {
    const created = await request(app.getHttpServer())
      .post('/notes')
      .send({ title: 'Title', content: 'Content' });

    await request(app.getHttpServer())
      .delete(`/notes/${created.body.id}`)
      .expect(200);

    await request(app.getHttpServer()).get('/notes').expect(200).expect([]);
  });

  it('/notes/:id (DELETE) returns 404 when the note does not exist', () => {
    return request(app.getHttpServer()).delete('/notes/999').expect(404);
  });
});
