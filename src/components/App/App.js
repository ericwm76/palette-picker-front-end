import React, { Component } from 'react';
import './App.scss';
import Color from '../Color/Color';
import InputForm from '../InputForm/InputForm';
import ProjectsContainer from '../ProjectsContainer/ProjectsContainer';
import {
  getUserProjects,
  postPalette,
  postProject,
  getProjectPalettes,
  deleteProject
} from '../../utils/apiCalls';

class App extends Component {
  constructor() {
    super();
    this.state = {
      user: { id: 1, user_name: 'Bob' },
      projects: [],
      currentProjectId: null,
      color0: { hex: '4f4f4f', isLocked: false },
      color1: { hex: '1c6a77', isLocked: false },
      color2: { hex: '678b91', isLocked: false },
      color3: { hex: '95e6f4', isLocked: false },
      color4: { hex: '2dd0ed', isLocked: false }
    };
  }

  componentDidMount() {
    this.getStartingColors();
    this.setUserProjects();
  }

  setUserProjects = async () => {
    const { user } = this.state;
    let fechProjects = await getUserProjects(user.id);
    let userProjects = await Promise.all(fechProjects);

    let mappedProjects = userProjects.map(async project => {
      let fetchedPalletes = await getProjectPalettes(project.id);
      if (fetchedPalletes.length) {
        let cleanedProject = await {
          ...project,
          palettes: await Promise.all(fetchedPalletes)
        };
        return cleanedProject;
      } else {
        return [];
      }
    });

    await this.setState({ projects: await Promise.all(mappedProjects) });
  };

  generateColor = () => {
    return Math.floor(Math.random() * 16777215).toString(16);
  };

  getStartingColors = () => {
    this.setState({
      color0: { hex: this.generateColor(), isLocked: false },
      color1: { hex: this.generateColor(), isLocked: false },
      color2: { hex: this.generateColor(), isLocked: false },
      color3: { hex: this.generateColor(), isLocked: false },
      color4: { hex: this.generateColor(), isLocked: false }
    });
  };

  getColors = () => {
    let { color0, color1, color2, color3, color4 } = this.state;
    let colors = [color0, color1, color2, color3, color4];
    colors.forEach(color => {
      if (!color.isLocked) color.hex = this.generateColor();
    });
    this.setState({ color0, color1, color2, color3, color4 });
  };

  handleColorChange = (index, hex) => {
    let { isLocked } = this.state[index];
    this.setState({ [index]: { hex: hex.substring(1), isLocked } });
  };

  toggleColorLock = index => {
    let { hex, isLocked } = this.state[index];
    isLocked = !isLocked;
    this.setState({ [index]: { hex, isLocked } });
  };

  setCurrentProject = projectName => {
    const currentProject = this.state.projects.find(
      project => project.project_name === projectName
    );
    this.setState({ currentProjectId: currentProject.id });
  };

  addPalette = async paletteName => {
    await postPalette({
      project_id: this.state.currentProjectId,
      palette_name: paletteName,
      color0: this.state.color0.hex,
      color1: this.state.color1.hex,
      color2: this.state.color2.hex,
      color3: this.state.color3.hex,
      color4: this.state.color4.hex
    });
    this.setUserProjects();
  };

  addProject = async projectName => {
    await postProject({
      user_id: this.state.user.id,
      project_name: projectName
    });
    this.setUserProjects();
  };

  removeProject = async id => {
    const { projects } = this.state;
    const filteredProjects = projects.filter(project => project.id !== id);
    this.setState({ projects: filteredProjects });
    deleteProject(id);
  };

  render = () => {
    const { color0, color1, color2, color3, color4, projects } = this.state;
    const colors = [color0, color1, color2, color3, color4];
    const displayColors = colors.map((color, i) => {
      colors.unshift(...colors.splice(-1));
      return (
        <Color
          colors={[...colors]}
          key={`color` + i}
          index={`color${4 - i}`}
          handleColorChange={this.handleColorChange}
          toggleColorLock={this.toggleColorLock}
        />
      );
    });
    return (
      <div className='App'>
        <nav>
          <h1>
            <span className='page__title'>Picker of Palettes</span>
          </h1>{' '}
          <span></span>
        </nav>
        <main>{displayColors}</main>
        <button type='button' onClick={this.getColors}>
          Generate New Palette
        </button>
        <InputForm
          projects={projects}
          key={'inputForm'}
          addPalette={this.addPalette}
          setCurrentProject={this.setCurrentProject}
          addProject={this.addProject}
        />
        {/* need function to edit and delete projects and palettes */}

        <ProjectsContainer
          projects={projects}
          key={'projectsContainer'}
          removeProject={this.removeProject}
        />
      </div>
    );
  };
}

export default App;
