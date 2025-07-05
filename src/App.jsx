import React, { useState } from 'react';
import * as Tone from 'tone'; // Импортируем Tone.js

function App() {
  // Состояние для отображения текущей ноты
  const [currentNote, setCurrentNote] = useState('');

  // Функция для воспроизведения ноты
  const playNote = async (note) => {
    // Запускаем Web Audio API контекст при первом взаимодействии пользователя
    // Это важно для совместимости с браузерами
    await Tone.start();
    console.log('Audio context started');

    // Создаем синтезатор. PolySynth позволяет играть несколько нот одновременно,
    // но для одной ноты подойдет и MonoSynth, однако PolySynth более универсален.
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'sine' // Простой синусоидальный осциллятор для начала
      }
    }).toDestination(); // Подключаем к выходу звуковой карты

    // Воспроизводим ноту
    synth.triggerAttackRelease(note, '8n'); // '8n' означает длительность - восьмая нота
    setCurrentNote(note); // Обновляем состояние для отображения ноты

    // Очищаем синтезатор после воспроизведения, чтобы не накапливать их в памяти
    // Можно переиспользовать один синтезатор, если это более сложная логика
    setTimeout(() => {
      synth.dispose();
    }, 1000); // Уничтожаем синтезатор через 1 секунду
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Тренажер гитарных нот</h1>
      <p>Текущая нота: <strong>{currentNote || 'Нажмите кнопку'}</strong></p>
      <button
        onClick={() => playNote('E4')} // Пример: нота Ми четвертой октавы (открытая первая струна)
        style={{ padding: '10px 20px', fontSize: '18px', cursor: 'pointer' }}
      >
        Сыграть ноту E4
      </button>
      <button
        onClick={() => playNote('A#5')} // Пример: нота Ля третьей октавы (открытая пятая струна)
        style={{ marginLeft: '10px', padding: '10px 20px', fontSize: '18px', cursor: 'pointer' }}
      >
        Сыграть ноту A3
      </button>
    </div>
  );
}

export default App;