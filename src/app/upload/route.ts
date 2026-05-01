import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Verificar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de arquivo não permitido' }, { status: 400 });
    }

    // Verificar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Criar nome único para o arquivo
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = path.extname(file.name);
    const filename = `${timestamp}-${random}${extension}`;
    
    // Garantir que a pasta uploads existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const imageUrl = `/uploads/${filename}`;

    return NextResponse.json({ success: true, url: imageUrl });
  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 });
  }
}