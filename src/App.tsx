import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Lessons from './pages/Lessons';
import LessonView from './pages/LessonView';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lessons/:courseId" element={<Lessons />} />
          <Route path="/lessons/:courseId/:lessonId" element={<LessonView />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
