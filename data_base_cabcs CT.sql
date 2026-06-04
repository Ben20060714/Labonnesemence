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