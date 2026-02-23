import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Lessons from './pages/Lessons';
import LessonView from './pages/LessonView';
import DSDModellsatz1View from './pages/DSDModellsatz1View';
import DSDHorverstehen1View from './pages/DSDHorverstehen1View';
import DSDTestsList from './pages/DSDTestsList';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lessons/:courseId" element={<Lessons />} />
          <Route path="/lessons/:courseId/:lessonId" element={<LessonView />} />
          <Route path="/german/dsd-tests" element={<DSDTestsList />} />
          <Route path="/german/dsd-modellsatz-1" element={<DSDModellsatz1View />} />
          <Route path="/german/dsd-modellsatz-2" element={<DSDHorverstehen1View />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
