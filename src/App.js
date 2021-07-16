import { useState, useEffect} from "react";
import Header from "./components/Header";
import Tasks from "./components/Tasks";


function App() {
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [currentFilter, setCurrentFilter] = useState([]);
  const [selectedNews, setSelectedNews] = useState('angular');

  let getLocalFavs = tasks.filter(e => e.localFavs === "true")

  useEffect(() => {
    const getTasks = async (opt) =>{
      const tasksFromAPI =  await fetchTasks(opt)
      setTasks(tasksFromAPI)
      setFilteredTasks(tasksFromAPI);
      setCurrentFilter('all');
    }

    getTasks(selectedNews);
  },[])

  const fetchTasks =  async (opt) => {
   
    const res = await fetch("https://hn.algolia.com/api/v1/search_by_date?query="+ opt.toLowerCase() +"&page=0");
    const data = await res.json()
    const hitList = [];

    //push localFavs on current data
    data.hits.forEach((hit) => {
      hit.localFavs = getLocalStorageFavs(hit.objectID);
      if(hit.author !== undefined &&  hit.author !== null && 
          hit.story_title !== undefined &&  hit.story_title !== null && 
          hit.story_url !== undefined &&  hit.story_url !== null && 
          hit.created_at !== undefined && hit.created_at !== null ){
            // if the title is too long
            hit.story_title = (hit.story_title.length > 60 ) ? hit.story_title.substring(0, 60) + ' ...' : hit.story_title
            hitList.push(hit)
      }
    });
    console.log(hitList)
    
    return hitList
  }

  //Toggle Favs
  const toggleFavs = (id) => {
    //local storage can only store strings
    const localFav = getLocalStorageFavs(id) === "true" ? "false" : "true";
    localStorage.setItem('localStorageFavs_'+ id, localFav);
    setTasks(tasks.map((task) => task.objectID === id ? { ...task, localFavs: localFav}: task)) 
    setFilteredTasks(currentFilter === 'all' ? tasks : getLocalFavs) 
    console.log(filteredTasks)
  }

  //get LocalFavs
  const getLocalStorageFavs = (id) => {  
    const localFav = localStorage.getItem('localStorageFavs_'+ id)
    return localFav !== undefined && localFav !== null ? localFav : "false";   
  }

  //filter local favs
  const showLocalFavs = () =>{  
    setFilteredTasks(getLocalFavs)
    setCurrentFilter('favs')
    console.log("showLocalFavs" + filteredTasks)
  }

  //filter all tasks
  const showAllTasks = () => {
    setFilteredTasks(tasks)
    setCurrentFilter('all')
    console.log("howAllTasks" + filteredTasks)
  }


  const selectNews= (selected) =>{
    console.log("selected" + selected)
    setSelectedNews(selected);
    console.log("setSelectedNews" + selectedNews)
  }

  return (
    <div className="container">
      <Header/>
      
      {tasks.length > 0 ?(
        <Tasks tasks = {filteredTasks} 
            showLocalFavs={showLocalFavs}
            showAllTasks={showAllTasks}
            currentFilter={currentFilter}
            onSelect={selectNews}
            selectedNews={selectedNews}
            onToggle={toggleFavs}  />
      ) : (
        "No tasks to wshow"
      )}   
    </div>
  );
}

export default App;