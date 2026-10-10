// Serves files saved on disk by private-file-storage, only through a valid, unexpired signed link.
import { Router } from 'express';
import { read_local_private_file } from './private-file-storage.js';

export const private_file_router = Router();

private_file_router.get('/private-files/:token', async (req, res, next) => {
  try {
    const { buffer, mime_type } = await read_local_private_file(req.params.token);
    // The app's pages run on another origin, so images must be allowed to load cross-origin.
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Cache-Control', 'private, max-age=600');
    res.type(mime_type).send(buffer);
  } catch (err) {
    next(err);
  }
});
