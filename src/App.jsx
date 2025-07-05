import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';

// Определяем стандартные открытые струны гитары и их минимальный лад
const openStrings = [
  { name: 'E2', midi: 40, stringNum: 6 }, // 6-я струна (самая толстая)
  { name: 'A2', midi: 45, stringNum: 5 },
  { name: 'D3', midi: 50, stringNum: 4 },
  { name: 'G3', midi: 55, stringNum: 3 },
  { name: 'B3', midi: 59, stringNum: 2 },
  { name: 'E4', midi: 64, stringNum: 1 }, // 1-я струна (самая тонкая)
];

// Функция для конвертации MIDI-ноты в строковое название (например, 64 -> E4)
// Tone.js умеет работать с MIDI-нотами, но для отображения пользователю лучше название.
// Эта функция упрощенная, для полного покрытия нужна библиотека или большая карта.
const midiToNoteName = (midiNumber) => {
  return Tone.Frequency(midiNumber, 'midi').toNote();
};

function App() {
  const [currentNoteInfo, setCurrentNoteInfo] = useState({ note: '', string: '', fret: '' });
  const [intervalTime, setIntervalTime] = useState(2000); // Интервал в мс (2 секунды)
  const [isPlaying, setIsPlaying] = useState(false); // Состояние тумблера
  const [fretboardCeiling, setFretboardCeiling] = useState(12); // Верхний потолок ладов (по умолчанию 12)

  const synthRef = useRef(null); // useRef для хранения экземпляра синтезатора
  const intervalIdRef = useRef(null); // useRef для хранения ID интервала

  // Инициализация синтезатора при монтировании компонента
  useEffect(() => {
    // Создаем PolySynth, чтобы можно было использовать его повторно
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'sine' // Обычный синусоидальный синтезатор
      }
    }).toDestination();

    // Очистка синтезатора при размонтировании компонента
    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
      }
    };
  }, []); // Пустой массив зависимостей: эффект запускается один раз при монтировании

  // Функция для генерации и воспроизведения случайной ноты
  const playRandomNote = useCallback(async () => {
    await Tone.start(); // Запуск аудио контекста при первом взаимодействии

    // 1. Выбираем случайную струну
    const randomStringIndex = Math.floor(Math.random() * openStrings.length);
    const selectedString = openStrings[randomStringIndex];

    // 2. Выбираем случайный лад в заданном диапазоне
    // Лады от 0 (открытая струна) до fretboardCeiling
    const randomFret = Math.floor(Math.random() * (parseInt(fretboardCeiling, 10) + 1));

    // 3. Вычисляем MIDI-ноту: MIDI открытой струны + количество ладов
    const noteMidi = selectedString.midi + randomFret;

    // 4. Конвертируем MIDI-ноту в название для отображения
    const noteName = midiToNoteName(noteMidi);

    // 5. Воспроизводим ноту
    synthRef.current.triggerAttackRelease(noteMidi, '8n'); // '8n' - восьмая нота

    // 6. Обновляем состояние для отображения
    setCurrentNoteInfo({
      note: noteName,
      string: `Струна ${selectedString.stringNum}`,
      fret: `Лад ${randomFret}`
    });
  }, [fretboardCeiling]); // Зависимость: пересоздаем, если меняется потолок ладов

  // Эффект для управления интервалом воспроизведения
  useEffect(() => {
    if (isPlaying) {
      // Очищаем предыдущий интервал, если он был
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      // Запускаем новый интервал
      intervalIdRef.current = setInterval(playRandomNote, intervalTime);
    } else {
      // Если isPlaying = false, очищаем интервал
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    }

    // Очистка интервала при размонтировании компонента или изменении isPlaying/intervalTime
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [isPlaying, intervalTime, playRandomNote]); // Зависимости: изменения этих значений вызовут перезапуск эффекта

  // Обработчик изменения интервала
  const handleIntervalChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setIntervalTime(value);
  };

  // Обработчик изменения потолка ладов
  const handleFretboardCeilingChange = (e) => {
    const value = parseInt(e.target.value, 10);
    // Проверяем, чтобы значение было не отрицательным и не слишком большим (например, до 24 ладов)
    setFretboardCeiling(Math.max(0, Math.min(24, value)));
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'Arial, sans-serif'}}>
      <h1>Тренажер гитарных нот</h1>

      {/* Настройки */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', display: 'inline-block' }}>
        <h2>Настройки</h2>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="intervalTime" style={{ marginRight: '10px' }}>
            Интервал между нотами (мс):
          </label>
          <input
            id="intervalTime"
            type="number"
            min="500" // Минимум 0.5 секунды
            max="10000" // Максимум 10 секунд
            step="100"
            value={intervalTime}
            onChange={handleIntervalChange}
            style={{ padding: '8px', fontSize: '16px', width: '80px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="fretboardCeiling" style={{ marginRight: '10px' }}>
            Верхний лад (0-24):
          </label>
          <input
            id="fretboardCeiling"
            type="number"
            min="0"
            max="24"
            step="1"
            value={fretboardCeiling}
            onChange={handleFretboardCeilingChange}
            style={{ padding: '8px', fontSize: '16px', width: '60px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            padding: '12px 25px',
            fontSize: '18px',
            cursor: 'pointer',
            backgroundColor: isPlaying ? '#ff4d4d' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontWeight: 'bold',
            transition: 'background-color 0.3s ease'
          }}
        >
          {isPlaying ? 'Остановить игру' : 'Начать игру'}
        </button>
      </div>

      {/* Отображение текущей ноты */}
      <div style={{ marginTop: '30px' }}>
        <h2>Текущая нота:</h2>
        <p style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#333' }}>
          {currentNoteInfo.note || '---'}
        </p>
        <p style={{ fontSize: '1.5em', color: '#666' }}>
          {currentNoteInfo.string || '---'}
        </p>
        <p style={{ fontSize: '1.5em', color: '#666' }}>
          {currentNoteInfo.fret || '---'}
        </p>
      </div>

      {isPlaying && (
        <p style={{ marginTop: '20px', fontSize: '1.1em', color: '#007bff' }}>
          Новая нота прозвучит через {(intervalTime / 1000).toFixed(1)} секунд.
        </p>
      )}
    </div>
  );
}

export default App;