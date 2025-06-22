const SearchBar = ({ search, handler }) => {
  return (
    <div>
      find countries
      <input
        value={search}
        onChange={handler}
        placeholder="Search for a country"
      />
    </div>
  );
};

export default SearchBar;
