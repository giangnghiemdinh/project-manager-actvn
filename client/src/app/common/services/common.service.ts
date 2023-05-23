import { Injectable } from '@angular/core';
import { AbstractService } from '../abstracts';
import { Observable } from 'rxjs';
import { Semester } from '../models/semester.model';
import { toNonAccentVietnamese } from '../utilities';

@Injectable({
  providedIn: 'root'
})
export class CommonService extends AbstractService {
  getSemesters(): Observable<Semester[]> {
    return this.get('common/semesters');
  }

  uploadFile(files: any, folderId: string): Observable<{ id: string, name: string }[]> {
    const formData: FormData = new FormData();
    formData.append('folderId', folderId);
    if (files.length > 0) {
      for (let file of files) {
        formData.append('file', file, toNonAccentVietnamese(file.name));
      }
    }
    return this.post(`common/file`, formData);
  }

  deleteFile(fileId: string) {
    return this.delete(`common/file/${fileId}`);
  }
}
