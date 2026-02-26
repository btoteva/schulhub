import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Lessons from './pages/Lessons';
import LessonView from './pages/LessonView';
import DSDModellsatz1View from './pages/DSDModellsatz1View';
import DSDModellsatz2View from './pages/DSDModellsatz2View';
import DSDModellsatz3View from './pages/DSDModellsatz3View';
import DSDHorverstehen1View from './pages/DSDHorverstehen1View';
import DSDHorverstehen2View from './pages/DSDHorverstehen2View';
import DSDHorverstehen3View from './pages/DSDHorverstehen3View';
import DSDSchriftliche1View from './pages/DSDSchriftliche1View';
import DSDSchriftliche2View from './pages/DSDSchriftliche2View';
import DSDSchriftliche3View from './pages/DSDSchriftliche3View';
import DSDTestsList from './pages/DSDTestsList';
import GermanPodcastView from './pages/GermanPodcastView';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lessons/:courseId" element={<Lessons />} />
          <Route path="/lessons/:courseId/:lessonId" element={<LessonView />} />
          <Route path="/german/dsd-tests" element={<DSDTestsList />} />
          <Route path="/german/podcast" element={<GermanPodcastView />} />
          <Route path="/german/podcast/:episodeId" element={<GermanPodcastView />} />
          <Route path="/german/dsd-modellsatz-1" element={<DSDModellsatz1View />} />
          <Route path="/german/dsd-modellsatz-2" element={<DSDHorverstehen1View />} />
          <Route path="/german/dsd-modellsatz-3" element={<DSDModellsatz2View />} />
          <Route path="/german/dsd-modellsatz-4" element={<DSDModellsatz3View />} />
          <Route path="/german/dsd-horverstehen-2" element={<DSDHorverstehen2View />} />
          <Route path="/german/dsd-horverstehen-3" element={<DSDHorverstehen3View />} />
          <Route path="/german/dsd-schriftliche-1" element={<DSDSchriftliche1View />} />
          <Route path="/german/dsd-schriftliche-2" element={<DSDSchriftliche2View />} />
          <Route path="/german/dsd-schriftliche-3" element={<DSDSchriftliche3View />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
