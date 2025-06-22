const FilterBar = ({ search, searchName }) => {
  return (
    <p>
      filter shown with: <input value={search} onChange={searchName} />
    </p>
  );
};

export default FilterBar;
