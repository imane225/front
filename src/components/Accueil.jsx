import React from 'react';
import './Accueil.css';
import { useNavigate } from 'react-router-dom';
import { FaHeartbeat, FaCarSide, FaUserShield, FaHome } from 'react-icons/fa';

const services = [
  {
    title: 'e-Santé',
    description: 'Gérez vos remboursements santé en ligne.',
    route: '/sante',
    icon: <FaHeartbeat size={30} color="#234585" />
  },
  {
    title: 'e-Flotte',
    description: 'Suivi des sinistres de votre flotte automobile.',
    route: '/flotte',
    icon: <FaCarSide size={30} color="#234585" />
  },
  {
    title: 'e-Prévoyance',
    description: 'Services de prévoyance simplifiés.',
    route: '/prevoyance',
    icon: <FaUserShield size={30} color="#234585" />
  },
  {
    title: 'e-IARD',
    description: 'Vos contrats habitation, automobile et plus.',
    route: '/iard',
    icon: <FaHome size={30} color="#234585" />
  }
];

const Accueil = () => {
  const navigate = useNavigate();

  return (
    <div className="accueil-container">
      <header className="accueil-header">
        <h1>Bienvenue sur votre Espace  RMA</h1>
        <p>Accédez à tous vos services en ligne, rapidement et en toute sécurité.</p>
      </header>

      <section className="accueil-services">
        {services.map((service, index) => (
          <div className="service-card" key={index} onClick={() => navigate(service.route)}>
            <div className="icon-wrapper">{service.icon}</div>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <button className="btn-discover">Découvrir</button>
          </div>
        ))}
      </section>

      <footer className="accueil-footer">
        © {new Date().getFullYear()} RMA Assurance. Tous droits réservés.
      </footer>
    </div>
  );
};

export default Accueil;
