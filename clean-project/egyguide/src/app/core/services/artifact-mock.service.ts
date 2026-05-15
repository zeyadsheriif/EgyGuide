import { Injectable, signal } from '@angular/core';
import { Artifact } from '../models/artifact.model';

@Injectable({
  providedIn: 'root'
})
export class ArtifactMockService {
  private artifacts = signal<Artifact[]>([
    {
      id: '1',
      landmark: 'Great Sphinx of Giza',
      imageUrl: 'assets/images/sphinx.JPG',
      date: 'Oct 26, 2023',
      dynasty: '4th (c. 2500 BC)',
      pharaoh: 'Khafre',
      location: 'Giza Plateau',
      description: 'The Great Sphinx is one of the world\'s largest and oldest statues.'
    },
    {
      id: '2',
      landmark: 'Tutankhamun',
      imageUrl: 'assets/images/tutankhamun.jpg',
      date: 'Oct 26, 2023',
      dynasty: '18th Dynasty',
      pharaoh: 'Tutankhamun',
      location: 'Valley of the Kings',
      description: 'The golden mask of the boy king.'
    },
    {
      id: '3',
      landmark: 'Nefertiti',
      imageUrl: 'assets/images/nefertiti.jpg',
      date: 'Oct 26, 2023',
      dynasty: '18th Dynasty',
      pharaoh: 'Akhenaten',
      location: 'Amarna',
      description: 'The famous bust of Queen Nefertiti.'
    },
    {
      id: '4',
      landmark: 'Rosetta Stone',
      imageUrl: 'assets/images/rosetta-stone.jpg',
      date: 'Oct 26, 2023',
      dynasty: 'Ptolemaic Dynasty',
      pharaoh: 'Ptolemy V',
      location: 'Rosetta',
      description: 'The key to deciphering hieroglyphics.'
    },
    {
      id: '5',
      landmark: 'Dafuar Purish',
      imageUrl: 'assets/images/dafuar.jpg',
      date: 'Oct 26, 2023',
      dynasty: 'Unknown',
      pharaoh: 'Unknown',
      location: 'Unknown',
      description: 'Ancient Egyptian artifact.'
    },
    {
      id: '6',
      landmark: 'Tutankrimun',
      imageUrl: 'assets/images/tutankrimun.jpg',
      date: 'Oct 26, 2023',
      dynasty: 'Unknown',
      pharaoh: 'Unknown',
      location: 'Unknown',
      description: 'Ancient Egyptian artifact.'
    },
    {
      id: '7',
      landmark: 'Rosetta Stone',
      imageUrl: 'assets/images/rosetta-stone.jpg',
      date: 'Oct 25, 2023',
      dynasty: 'Ptolemaic Dynasty',
      pharaoh: 'Ptolemy V',
      location: 'Rosetta',
      description: 'The key to deciphering hieroglyphics.'
    },
    {
      id: '8',
      landmark: 'Rosetta Iuna',
      imageUrl: 'assets/images/rosetta-iuna.jpg',
      date: 'Oct 26, 2023',
      dynasty: 'Unknown',
      pharaoh: 'Unknown',
      location: 'Unknown',
      description: 'Ancient Egyptian artifact.'
    }
  ]);

  getArtifacts() {
    return this.artifacts();
  }

  getArtifactById(id: string) {
    return this.artifacts().find(a => a.id === id);
  }

  addToHistory(artifact: Artifact) {
    this.artifacts.update(artifacts => [artifact, ...artifacts]);
  }
}