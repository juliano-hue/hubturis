import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const providerId = formData.get('providerId') as string || 'general';
    const attractionId = formData.get('attractionId') as string || 'general';

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Check type by mime or extension (for drag & drop that loses mime type)
    const imgTypes = ['image/jpeg','image/jpg','image/png','image/webp','image/gif','image/bmp'];
    const vidTypes = ['video/mp4','video/webm','video/quicktime','video/x-msvideo'];
    const imgExts = ['.jpg','.jpeg','.png','.webp','.gif','.bmp'];
    const vidExts = ['.mp4','.webm','.mov','.avi'];

    const ext = path.extname(file.name).toLowerCase();
    const isImage = imgTypes.includes(file.type) || imgExts.includes(ext);
    const isVideo = vidTypes.includes(file.type) || vidExts.includes(ext);

    if (!isImage && !isVideo) {
      return NextResponse.json({ error: 'Tipo não permitido. Use JPG, PNG, WEBP, MP4 ou WEBM.' }, { status: 400 });
    }

    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: `Arquivo muito grande. Máximo ${isVideo ? '50MB' : '10MB'}` }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const filename = `${timestamp}-${random}${ext || '.jpg'}`;

    // Organized structure: /uploads/providerId/attractionId/filename
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', providerId, attractionId);
    await mkdir(uploadDir, { recursive: true });

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const fileUrl = `/uploads/${providerId}/${attractionId}/${filename}`;

    console.log(`✅ Upload: ${fileUrl} (${file.name})`);

    return NextResponse.json({ success: true, url: fileUrl, type: isVideo ? 'video' : 'image' });
  } catch (error) {
    console.error('❌ Erro no upload:', error);
    return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 });
  }
}
