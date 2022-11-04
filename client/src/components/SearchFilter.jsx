import { useState } from "react";
import MultiRangeSlider from "multi-range-slider-react";
import TagsSelector from "./TagsSelector";
import './style/slider.css';
import { getAllTags } from "../services/tags";
import { filterUsers } from "../services/users";
import './style/slider.css'



const SearchForm = ({states, dropMenu}) => {


	const handleSubmit = (event) => {
		event.preventDefault();

		const filters = {
			distance: states.distance,
			minAge: states.minAge,
			maxAge: states.maxAge,
			tags: states.tags,
			gender: states.gender,
			preference: states.preference,
			userLocation: states.location,
		}
		filterUsers(filters).then(response => {
			states.setUsers(response.data);
		})
		dropMenu();
	}

	const handleAgeChange = (e) => {
		states.setMinAge(e.minValue);
		states.setMaxAge(e.maxValue);
	};
	return (
		<div>
			<form >
				<label>Age </label> <small> {states.minAge} - {states.maxAge}</small>
			<MultiRangeSlider
				min={18}
				max={65}
				step={1}
				minValue={states.minAge}
				maxValue={states.maxAge}
				ruler={false}
				style={{ border: "none", boxShadow: "none" }}
				barLeftColor="white"
				barInnerColor="black"
				barRightColor="white"
				onInput={(e) => {
					handleAgeChange(e);
				}}
			/>
			<label className="mt-2">Distance</label> <small>{states.distance} km</small><br></br>
			<input type="range" min="0" max="1000" value={states.distance} onChange={(e) => {states.setDistance(e.target.value)}}></input><br></br>
			<label>Tags</label>
			<TagsSelector setInterests={states.setTags} interests={states.tags} tags={states.allTags}/>
			<div className="d-flex align-content-center">
				<>*****</>
				<button className="ml-5" id="submitFilters" type="submit" onClick={(event) => handleSubmit(event)}>Filter</button>
			</div>
			</form>
			
		</div>
	)
}

const SearchFilter = ({states}) => {

		const [showHide, setShowHide] = useState(false);
	
		const dropMenu = () => {
			setShowHide(!showHide);
		}
		return (
			<>
				<div className="burger" onClick={() => dropMenu()}></div>
				{showHide ? <> <SearchForm dropMenu={dropMenu} className="bg-alert" states={states}/> </> : null}
			</>
		)
}

export default SearchFilter;