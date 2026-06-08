-- ============================================
-- Base de données CABCS (Église)
-- Version améliorée
-- ============================================

-- Création de la table membres
CREATE TABLE IF NOT EXISTS membres_cabcs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(10) NOT NULL,
  post_nom VARCHAR(10),
  prenom VARCHAR(10),
  genre ENUM('M', 'F') NOT NULL,
  date_de_naissance DATE NOT NULL,
  telephone VARCHAR(20),
  fonction ENUM('pasteur', 'ancien', 'diacre', 'moniteur', 'choriste') NOT NULL,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Index pour les recherches fréquentes
CREATE INDEX idx_fonction ON membres_cabcs(fonction);
CREATE INDEX idx_nom ON membres_cabcs(nom);
CREATE INDEX idx_post_nom ON membres_cabcs(post_nom);
CREATE INDEX idx_prenom ON membres_cabcs(prenom);
CREATE INDEX idx_date_naissance ON membres_cabcs(date_de_naissance);

CREATE TABLE IF NOT EXISTS images_cabcs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_membre INT NOT NULL,
  url VARCHAR(255) NOT NULL,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_membre) REFERENCES membres_cabcs(id) ON DELETE CASCADE
);

CREATE INDEX idx_id_membre ON images_cabcs(id_membre);
CREATE INDEX idx_url ON images_cabcs(url);
CREATE INDEX idx_date_creation ON images_cabcs(date_creation);
CREATE INDEX idx_date_modification ON images_cabcs(date_modification);

-- Création de la table evenements

CREATE TABLE IF NOT EXISTS evenements_cabcs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  date_evenement DATE NOT NULL,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_titre ON evenements_cabcs(titre);
CREATE INDEX idx_date_evenement ON evenements_cabcs(date_evenement);
CREATE INDEX idx_date_creation ON evenements_cabcs(date_creation);
CREATE INDEX idx_date_modification ON evenements_cabcs(date_modification);