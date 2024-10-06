import './App.css';
import Graph from "react-graph-vis";
import React, { useState,useEffect, useRef  } from "react";
import NodePopup from './popUp_Folder/NodePopup';
import { ThreeDots } from "react-loader-spinner" // Import the specific loader component
import "./App.css" // Ensure you import the CSS file

//deklarasi
let coreTopicNumber=0;
let nextIdForPaper=1;
let urlPopup= "";

//minimap

const optionsMiniMap = {
  interaction: { zoomView: false, dragView: false },
  nodes: {
    shape: 'box',
    borderWidth: 2,
    widthConstraint:{
      maximum:300
      
    }
    },
  edges:{
    length: 100,
    
    arrows: {
      to: {
        enabled: true,
        type: 'arrow',
      }
    },
    smooth: {
      type: 'vertical',
      forceDirection: 'horizontal', // Forces edge direction to be horizontal
      roundness: 1,
    },
  },
  layout: {
    hierarchical: {
    enabled: true,
    levelSeparation: 300, // Menyesuaikan jarak antar level (vertikal)
    nodeSpacing: 100, // Menyesuaikan jarak antar node dalam satu level (horizontal)
    treeSpacing: 100,
    direction: 'LR', // Arah layout dari kiri ke kanan
    sortMethod: 'directed', // Metode pengurutan node
    edgeMinimization: true,
    parentCentralization: false,
    shakeTowards: 'roots',
    }
  },
  physics: {
    enabled: false,  
  },
};


let options = {
  // Definisikan opsi untuk komponen Graph di sini

  nodes: {
    shape: 'box',
    borderWidth: 2,
    widthConstraint:{
      maximum:300
      
    }
    },
  edges:{
    length: 100,
    
    arrows: {
      to: {
        enabled: true,
        type: 'arrow',
      }
    },
    smooth: {
      type: 'vertical',
      forceDirection: 'horizontal', // Forces edge direction to be horizontal
      roundness: 1,
    },
  },
  layout: {
    hierarchical: {
    enabled: true,
    levelSeparation: 300, // Menyesuaikan jarak antar level (vertikal)
    nodeSpacing: 100, // Menyesuaikan jarak antar node dalam satu level (horizontal)
    treeSpacing: 100,
    direction: 'LR', // Arah layout dari kiri ke kanan
    sortMethod: 'directed', // Metode pengurutan node
    edgeMinimization: true,
    parentCentralization: false,
    shakeTowards: 'roots',
    }
  },
  physics: {
    enabled: false,  
  },
  interaction: {
 
    keyboard: true           // Mengaktifkan kontrol keyboard
  }
}

function App() {

  //visualisasi graph
  const [graphState, setGraphState] = useState({
    "nodes": [
      
    ],
    "edges": [
      
    ]
  }
  
)

  //Untuk menghapus node node dan relasi yang telah dibuat
  const clearState =async() => {

    //menghapus isi kolom 
    document.getElementsByClassName("paperData")[0].value ="";
  
  setGraphState({
         nodes:[],
         edges:[]
        });
        
}

  //Untuk membuat graph

  const createGraph = () => {
    

    //agar muncul loading pada kursor
     document.body.style.cursor = "wait";
     setLoading(true)

     document.getElementsByClassName("generateButton")[0].disabled = true
      searchPaperQuery();
      
      

}

//mencari data paper di scopus
const searchPaperQuery = async () => {
  let date;
  let paperLimit= document.getElementsByClassName("PaperLimit")[0].value;
  let startYear= document.getElementsByClassName("startYear")[0].value;
  let endYear= document.getElementsByClassName("endYear")[0].value;
  
  if(startYear===endYear){
    date= startYear;
  }else{
    date = startYear+"-"+endYear;
  }
   
  let temp = document.getElementsByClassName("paperData")[0].value;
  try {
    //agar muncul loading pada kursor

    const query = encodeURIComponent(temp);
    const response = await fetch(`https://api.elsevier.com/content/search/scopus?query=TITLE(${query})&date=${date}&sort=citedby-count&count=${paperLimit}&apiKey=${process.env.REACT_APP_SCOPUS_API}`);
    const data = await response.json();
    // setSearchResult(data.results);
    console.log(data)
    const entries = data["search-results"].entry;
    const nodes = entries.map((entry,index)=>({ 
      id:(index+nextIdForPaper).toString(),
      label:entry["dc:title"]+" ("+new Date(entry["prism:coverDate"]).getFullYear()+")",
      doi: entry["prism:doi"],
      abstrak: entry.link[2]["@href"],
      database:0
    })
  
    );

    const edges = nodes.map((_, index) => ({
      from: coreTopicNumber,
      to: (index + nextIdForPaper).toString(),
      label:"Topic papers"

    }));
    console.log(nodes)
    console.log(edges)
    setGraphState({
      nodes: [
        ...graphState.nodes,
        {
          id: coreTopicNumber,
          label: temp,
          
        },
        ...nodes
      ],
      edges: [
        ...graphState.edges, 
        ...edges
      ]
    });

    //setting ID untuk berikutnya 
    coreTopicNumber+=(nodes.length+1);
    nextIdForPaper+=(nodes.length+1);
    
    //agar muncul loading pada kursor
    document.getElementsByClassName("generateButton")[0].disabled = false;
    setLoading(false);
    document.body.style.cursor = "default";
  } catch (error) {
    console.error('Error fetching search results:', error);
    
    document.body.style.cursor = "default";
    setTimeout(() => {
      alert('Paper not available'); 
    document.getElementsByClassName("generateButton")[0].disabled = false;
    setLoading(false);

    }, 300);
    setLoading(false);

  }
};

const searchPaperQueryLanjutan = async (selectedNode, doi) => {
  let paperLimit= document.getElementsByClassName("PaperLimit")[0].value;
  let startYear= document.getElementsByClassName("startYear")[0].value;
  let endYear= document.getElementsByClassName("endYear")[0].value;
  let date;
 
  //apabila paper tidak memiliki doi
  if(doi==null){
    alert('Paper doesn`t have DOI');
    document.body.style.cursor = "default";
    return;
  }

  if(startYear===endYear){
    date= startYear;
  }else{
    date = startYear+"-"+endYear;
  }
  
    try {
      //agar muncul loading pada kursor
      console.log(doi);
      const citedPaper = await fetch(`https://opencitations.net/index/coci/api/v1/references/${doi}`)
  
      const datacitedPaper = await citedPaper.json();
  
      const queryData = datacitedPaper.map(doi => `DOI(${doi.cited})`).join(' OR ');
      console.log(queryData)
      const response = await fetch(`https://api.elsevier.com/content/search/scopus?query=${queryData}&date=${date}&sort=citedby-count&count=${paperLimit}&apiKey=${process.env.REACT_APP_SCOPUS_API}`);
      const data = await response.json();
      const entries = data["search-results"].entry;
  
  // apabila tidak terdapat paper yang disitasi
       if(entries.length===1&&entries[0].error ==='Result set was empty'){
        console.log('Result set was empty');
        alert('Paper not available'); 
        document.body.style.cursor = "default";
        setLoading(false);
        return; 
       }
  //filter supaya tidak ada data redundan
  console.log(entries);
       const existingLabels = new Set(graphState.nodes.map(node => node.label));
       const filteredEntries = entries.filter(entry => !existingLabels.has(entry["dc:title"]));
  
       if(filteredEntries.length===0){
        console.log('Result set was empty');
        alert('citation not found in scopus database or papers outside year range'); 
        document.body.style.cursor = "default";
        return; 
       }
  
       const nodes = filteredEntries.map((entry,index)=>({
         id:(index+nextIdForPaper).toString(),
         label:entry["dc:title"]+" ("+new Date(entry["prism:coverDate"]).getFullYear()+")",
         doi: entry["prism:doi"],
         abstrak: entry.link[2]["@href"],
         database:0
  
  
        
       })
    
       );
  
      const edges = nodes.map((_, index) => ({
        from: selectedNode,
        to: (index + nextIdForPaper).toString(),
        label:"citing"
  
      }));
      
      console.log(nodes);
      console.log(edges);
      setGraphState({
        nodes: [
          ...graphState.nodes,
          ...nodes
        ],
        edges: [
          ...graphState.edges, 
          ...edges
        ]
      });
  
     
  
      // //setting ID untuk berikutnya 
   
      nextIdForPaper+=(nodes.length+1);
      selectedNode+=(nodes.length+1);
      // //agar muncul loading pada kursor
       
       document.getElementsByClassName("generateButton")[0].disabled = false;
       document.body.style.cursor = "default";
       setLoading(false) // Reset loading state to false
    

  
    } catch (error) {
      console.error('Error fetching search results:', error);
      document.body.style.cursor = "default";
      setLoading(false) // Reset loading state to false
      

    }
    updateMiniMap();
//   }else if(database===1){
//   try {
//    ///citing
//    console.log(`https://api.semanticscholar.org/graph/v1/paper/${doi}/citations?limit=${paperLimit}&year=${date}&fields=title,abstract,externalIds,publicationDate`);
//    const response = await fetch (`https://api.semanticscholar.org/graph/v1/paper/${doi}/citations?limit=${paperLimit}&year=${date}&fields=title,abstract,externalIds,publicationDate`,{
//     headers:{
//       'x-api-key':process.env.REACT_APP_SEMANTIC_API
//     },
  

//   });    
//     const data = await response.json();
//     console.log("scholar")
//     console.log(data)

//     const entries = data["search-results"].entry;

// // apabila tidak terdapat paper yang disitasi
//      if(entries.length===1&&entries[0].error ==='Result set was empty'){
//       console.log('citation not found in semantic scholar database or papers outside year range');
//       alert('Paper not available'); 
//       document.body.style.cursor = "default";
//       return; 
//      }
// //filter supaya tidak ada data redundan


//     const nodes = entries.map((entry,index)=>({
//       id:(index+nextIdForPaper).toString(),
//       label:entry["title"]+" ("+new Date(entry["publicationDate"]).getFullYear()+")",
//       doi: entry.externalIds.DOI,
//       abstrak: entry.abstract,
//       database:1
//     })
//     );

//     const edges = nodes.map((_, index) => ({
//       from: selectedNode,
//       to: (index + nextIdForPaper).toString(),
//       label:"citing"

//     }));
    
//     console.log(nodes);
//     console.log(edges);
//     setGraphState({
//       nodes: [
//         ...graphState.nodes,
//         ...nodes
//       ],
//       edges: [
//         ...graphState.edges, 
//         ...edges
//       ]
//     });

   

//     // //setting ID untuk berikutnya 
 
//     nextIdForPaper+=(nodes.length+1);
//     selectedNode+=(nodes.length+1);
//     // //agar muncul loading pada kursor
     
//      document.getElementsByClassName("generateButton")[0].disabled = false;
//      document.body.style.cursor = "default";

//   } catch (error) {
//     console.error('Error fetching search results:', error);
//     document.body.style.cursor = "default";
//   }
// }
};

const searchSimilarPaper = async(selectedNode, doi) => {
  let paperLimit= document.getElementsByClassName("PaperLimit")[0].value;
  let startYear= document.getElementsByClassName("startYear")[0].value;
  let endYear= document.getElementsByClassName("endYear")[0].value;
  let date;
  if(startYear===endYear){
    date= startYear;
  }else{
    date = startYear+"-"+endYear;
  }
console.log(doi);
  try {
    const response = await fetch (`https://api.semanticscholar.org/recommendations/v1/papers/forpaper/${doi}?limit=${paperLimit}&year=${date}&fields=title,abstract,externalIds,publicationDate`,{
      headers:{
        'x-api-key':process.env.REACT_APP_SEMANTIC_API
      },
    

    });
    const data = await response.json();
    const entries= data.recommendedPapers;
    
    if(entries.length===0){
      console.log('Result set was empty');
      alert('papers not found'); 
      document.body.style.cursor = "default";
      return; 
     }
    const nodes = entries.map((entry,index)=>({
      id:(index+nextIdForPaper).toString(),
      label:entry["title"]+" ("+new Date(entry["publicationDate"]).getFullYear()+")",
      doi: entry.externalIds.DOI,
      abstrak: entry.abstract,
      database:1


     
    })
 
    );

   const edges = nodes.map((_, index) => ({
     from: selectedNode,
     to: (index + nextIdForPaper).toString(),
     label:"similar paper"

   }));
   
   console.log(nodes);
   console.log(edges);
   setGraphState({
     nodes: [
       ...graphState.nodes,
       ...nodes
     ],
     edges: [
       ...graphState.edges, 
       ...edges
     ]
   });

  

   // //setting ID untuk berikutnya 

   nextIdForPaper+=(nodes.length+1);
   selectedNode+=(nodes.length+1);
   // //agar muncul loading pada kursor
    
    document.getElementsByClassName("generateButton")[0].disabled = false;
    document.body.style.cursor = "default";
    setLoading(false);
    
  } catch (error) {
    alert('Papers not found');
    document.body.style.cursor = "default";
    setLoading(false);

  }
  updateMiniMap();
}

const getPaperDetail= async(doi)=>{
  try {
    const response = await fetch (`https://api.semanticscholar.org/graph/v1/paper/${doi}?fields=title,abstract,externalIds,publicationDate`,{
      headers:{
        'x-api-key':process.env.REACT_APP_SEMANTIC_API
      }
    });
    const data = await response.json();
    setPaperDetail(data);
  } catch (error) {
    console.log("error pada get paper detail :"+error);
  }
}
  
  //set popup
  const [selectedNode, setSelectedNode] = useState(null);
  const [paperDetail, setPaperDetail] = useState(null);


  const handleNodeSelect = (event) => {
    setPaperDetail(null);
    const nodeId = event.nodes[0];
    const node = graphState.nodes.find(node => node.id === nodeId);
    setSelectedNode(node);
    getPaperDetail(node.doi);
    handleUrlInputChange(node.abstrak);
    // handleScrape(urlPopup);
  };
 

  //close pop up
  const handleClosePopup = () => {
    setSelectedNode(null);
   
  };
  // delete node
  const handleDeleteNode = () => {
    setGraphState((prevState) => ({
      ...prevState,
      nodes: prevState.nodes.filter(node => node.id !== selectedNode.id),
      edges: prevState.edges.filter(edge => edge.from !== selectedNode.id && edge.to !== selectedNode.id)
    }));
    handleClosePopup();
  };

  //search paper
  const handleSearchMore = () => {
    const searchQuery = encodeURIComponent(selectedNode.label);
    const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
    window.open(searchUrl, '_blank');
    
  };
// handle background click
   const handleClickBackGround1=() =>{
    handleClosePopup();
   }
  //Search citation
  const handleCitationSearch= async()=>{
    setLoading(true) // Set loading state to true

    document.body.style.cursor = "wait";
    handleClosePopup();
 console.log(selectedNode.doi);
    searchPaperQueryLanjutan(selectedNode.id, selectedNode.doi, selectedNode.database);    
    
  }

  const handleUrlInputChange=(url)=>{
    urlPopup= url;
    console.log(urlPopup);
  }

  const handleSimilarPaper= async()=>{
    setLoading(true) // Set loading state to true
    document.body.style.cursor = "wait";
    handleClosePopup();
    searchSimilarPaper (selectedNode.id, selectedNode.doi);

  }

//keyoboard handler enter for search
const onKeyDownHandler= e=>{
  document.body.style.cursor = "wait";

  if (e.keyCode===13){

    createGraph();

  }
  document.body.style.cursor = "default";
}

//paper limiter
const [paperLimit, setPaperLimit] = useState('10');
//start year
const [startYear, setStartYear] = useState(new Date().getFullYear()-5);

//end year
const [endYear, setendYear] = useState(new Date().getFullYear());

const [isSidebarVisible, setSidebarVisible] = useState(true); // Sidebar hidden by default on mobile

const handleChangeStartYear=(e)=>{
  const value=e.target.value;
  if (/^\d{0,4}$/.test(value)) {
    setStartYear(value);
  }
}
const handleChangeEndYear=(e)=>{
  const value=e.target.value;
  if (/^\d{0,4}$/.test(value)) {
    setendYear(value);
  }
}


const handleChangePaper = (e) => {
  const value = e.target.value

  if (/^\d*$/.test(value)) {
      // Allow only digits
      if (parseInt(value) > 25) {
          alert("Only a maximum of 25 papers can be displayed.")
          setPaperLimit("25")
      } else {
          setPaperLimit(value)
      }
  }
}

const [loading, setLoading] = useState(false);

///////////////////fungsi fit minimap
const miniMapNetworkRef = useRef(null);
const getMiniMapNetwork = (network) => {
  miniMapNetworkRef.current = network; // Simpan referensi network di miniMapNetworkRef
};
const updateMiniMap=()=>{
  
  if (miniMapNetworkRef.current){

    miniMapNetworkRef.current.fit({
      animation: true,
      scale:0.1
    })
  }
  console.log("masuk update minimap");
}
/////////////////////////////////
//////fitur klik minimap
const mainMapNetworkRef = useRef(null);

const getMainMapNetwork = (network) => {
 mainMapNetworkRef.current = network;
}

const eventsMiniMap = {
  click: (event) => {
    const { pointer } = event;
    const { x, y } = pointer.canvas;

     if (mainMapNetworkRef.current){
      mainMapNetworkRef.current.moveTo({
        position: {x,y},
        scale:1,
      })
    }
  }
};

/////////
useEffect(() => {
  if (miniMapNetworkRef.current){
    miniMapNetworkRef.current.moveTo({
      scale:0.1,
      animation:true
    })
  }
  console.log("jalan");
  if (mainMapNetworkRef.current) {
    // Pindahkan tampilan ke posisi x=1 dan y=5
    mainMapNetworkRef.current.moveTo({
      position: { x: 300, y: 20 },
      scale: 1, // Atur skala tampilan
    });
  }
  
}, []);

// show/hide sidebar

const toggleSidebar = () => {
  setSidebarVisible(!isSidebarVisible);
};


  return (
    <div className="h-screen w-screen flex flex-cols gap-2 bg-gradient-to-r from-indigo-200 via-red-200 to-yellow-100 background-animate">
      {/* SideBox */}
      {isSidebarVisible &&(
      <div className="border-2 border-black rounded-2xl ml-2 my-2 shadow-lg bg-white sidebox w-[400px]">
      {/* GraphGenerate */}
        <div className="">

          <div className="overflow-hidden">
            <div className="inputContainer">
              <div  className="xl:py-5 sm:py-3 xl:px-10 font-bold text-black text-center sm:text-md xl:text-xl bg-lime-300 text-black rounded-xl block mt-2 border-2 border-dashed border-slate-800 mb-10">
                <p>PAPERGRAPH</p>
              </div>
              <input
                type="text"
                className="paperData block p-2.5 w-full h-[80px] text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mt-1"
                placeholder="Ketik title paper yang ingin dicari"
                onKeyDown={onKeyDownHandler}
              />
              <div>
                <label htmlFor="paperLimit" className="block mt-2 text-sm font-bold text-gray-900 dark:text-black">
                  Limit Paper yang ditampilkan
                </label>
                <input
                  type="text"
                  className="PaperLimit block p-2.5 w-full h-[50px] text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mt-1"
                  placeholder="Limit Paper yang ditampilkan"
                  value={paperLimit}
                  onChange={handleChangePaper}
                />
              </div>
              <label htmlFor="startYear" className="block mt-2  text-sm font-bold text-gray-900 dark:text-black">
                  Tahun publikasi
                </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="startYear p-2.5 h-[50px] w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mt-1"
                  value={startYear}
                  onChange={handleChangeStartYear}
                />
                <span className="self-center">-</span>
                <input
                  type="text"
                  className="endYear p-2.5 h-[50px] w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mt-1"
                  value={endYear}
                  onChange={handleChangeEndYear}
                />
              </div>
              <button
                className="generateButton w-full xl:py-5 sm:py-3 xl:px-10 font-bold text-white hover:text-black text-center bg-slate-400 rounded-xl block mt-2 border-2 border-dashed border-slate-800 sm:text-md xl:text-xl"
                onClick={createGraph}
                tabIndex="0"
              >
                GENERATE GRAPH
              </button>
              <button
                className="clearButton w-full xl:py-5 sm:py-3 xl:px-10 font-bold text-white hover:text-black text-center sm:text-md xl:text-xl bg-pink-300 rounded-xl block mt-2 border-2 border-dashed border-slate-800"
                onClick={clearState}
              >
                MAKE GRAPH CLEAR
              </button>
            </div>
          </div>
        </div>
      </div>)}
         
      <div className="buttonShowHide">
        <button
          onClick={toggleSidebar}
          className={`fixed bottom-3 right-4 bg-blue-500 text-white p-2 rounded-lg shadow-lg z-30`}
          style={{ height: '2rem', width:'2rem'}}        
          >
          {isSidebarVisible ? (
           
             <svg
             xmlns="http://www.w3.org/2000/svg"
             fill="none"
             viewBox="0 0 24 24"
             strokeWidth="1.5"
             stroke="currentColor"
             className="w-6 h-6"
           >
             <path
               strokeLinecap="round"
               strokeLinejoin="round"
               d="M1 5.5l7.5 7.5 7.5-7.5"
             />
           </svg> // Panah ke bawah (untuk show)
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 10.5l-7.5-7.5-7.5 7.5"
              />
            </svg> // Panah ke atas (untuk hide)
          )}
        </button>
        </div>


      {/* GraphDisplay */}
      <div className=" graph-display border-2 border-black rounded-2xl mr-2 my-2 shadow-lg  overflow-hidden bg-white-800 bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-100 ">
      
        <Graph
        
          graph={graphState}
          options={options}
          events={{ selectNode: handleNodeSelect}} 
          style={{
            height: "800px",
            width: "1300px",
          }}
          getNetwork={getMainMapNetwork} // Ambil network mini map setelah render

        />
             {/* Minimap */}
             <div className="minimap" >
          <Graph
          
          graph={graphState}
          options={optionsMiniMap}
          events={eventsMiniMap}
          getNetwork={getMiniMapNetwork} // Ambil network mini map setelah render
        />
      </div>
      </div>
      <NodePopup 
        node={selectedNode}
        paperDetail={paperDetail}
        onClose={handleClosePopup}
        onDelete={handleDeleteNode}
        onSearchMore={handleSearchMore}
        onSearchCitation={handleCitationSearch}
        handleClickBackGround={handleClickBackGround1}
        onSimilarPaper={handleSimilarPaper}
      />
        {loading && (
          <div className="loading-overlay">
             <div className="loading-container">
                <ThreeDots color="#00BFFF" height={80} width={80} />
                  <div className="loading-text">
                     Loading, please wait...
              </div>
            </div>
          </div>
            )}

      
    </div>
  );
}

export default App;
