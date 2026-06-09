/**
 * src/pages/Channels.jsx
 * Route: /channels — discover + create Telegram-style channels.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../hooks/useAuth.js';
import ChannelSystem from '../components/chat/ChannelSystem.jsx';

export default function Channels() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Channels | BSDC — Bangladesh Software Development Community</title>
        <meta name="description" content="Discover BSDC channels — Telegram-style broadcast feeds for Bangladeshi developers, courses, and projects." />
        <link rel="canonical" href="https://www.bsdc.info.bd/channels" />
      </Helmet>

      <ChannelSystem
        currentUser={profile}
        onOpenChat={(id) => navigate(`/messages?chat=${id}`)}
      />
    </>
  );
}
