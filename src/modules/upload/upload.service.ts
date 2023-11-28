import * as admin from 'firebase-admin';
import { BadRequestException, Injectable } from '@nestjs/common';
import * as credential from '../../credentials/firebaseCredential.json';

@Injectable()
export class UploadService {
  private storage: admin.storage.Storage;
  private allowImageType = ['image/jpg', 'image/jpeg', 'image/png'];
  constructor() {
    const serviceAccount = <admin.ServiceAccount>{
      ...credential,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.STORAGE_BUCKET,
    });

    this.storage = admin.storage();
  }

  async uploadImage(image: Buffer, maxSize: number = 5242880) {
    try {
      if (!this._checkCondition(image, maxSize)) {
        throw new BadRequestException('Upload image failed');
      }
      const contentType = image['mimetype'];
      const originalName = image['originalname'];
      const limitLengthOfOriginalName = originalName.substring(
        originalName.length - 100,
      );
      const uniqueName =
        Date.now() +
        '_' +
        Math.round(Math.random() * 1000) +
        limitLengthOfOriginalName;
      const fileUpload = this.storage.bucket().file(`images/${uniqueName}`);
      const bufferData = Buffer.from(image['buffer']);
      await fileUpload.save(bufferData, {
        metadata: {
          contentType: contentType,
        },
      });
      const [url] = await fileUpload.getSignedUrl({
        action: 'read',
        expires: '03-09-2491',
      });
      console.log(url);
      return url;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async uploadImages(images: [Buffer], maxSize: number = 5242880) {
    const uploadedUrls = [];
    for (const image of images) {
      if (!this._checkCondition(image, maxSize)) {
        throw new BadRequestException('Upload images failed');
      }
    }
    for (const image of images) {
      const uploadedUrl = await this.uploadImage(image, maxSize);
      uploadedUrls.push(uploadedUrl);
    }
    return uploadedUrls;
  }

  _checkCondition(image: Buffer, maxSize: number = 5242880) {
    try {
      if (!image) {
        return false;
      }
      const contentType = image['mimetype'];
      if (!this.allowImageType.includes(contentType)) {
        return false;
        // throw new BadRequestException('File is not an image');
      }
      if (image['size'] > maxSize) {
        return false;
        // throw new BadRequestException(
        //   `Image must be smaller than ${maxSize / 1048576}MB`,
        // );
      }
      return true;
    } catch (e) {
      return false;
      // throw new BadRequestException(e);
    }
  }
}
