import React from 'react';

const API = 'https://pokeapi.co/api/v2';

const useFetch = (url, deps = undefined, conditional = false) => {
  const [state, setState] = React.useState({
    status: 'idle', // pending, resolved, rejected
    data: null,
    error: null,
  });

  React.useEffect(() => {
    if (conditional) {
      setState({ status: 'idle' });
      return;
    }
    setState({ status: 'pending' });

    fetch(url)
      .then(data => {
        if (data.status >= 300) {
          throw new Error(`Fetch failed with status ${data.status}`);
        }
        return data.json();
      })
      .then(data => {
        setState({ status: 'resolved', data });
      })
      .catch(err => setState({ status: 'rejected', error: err.message }));
  }, [...deps, url, conditional]);

  return state;
};

const PokemonSuccess = ({ height, weight, sprites }) => {
  const images = Object.entries(sprites).filter(([, src]) => typeof src === 'string');
  return (
    <div>
      Height: {height}, Weight: {weight}
      <div>
        {images.map(([alt, src]) => {
          return <img key={alt} src={src} alt={alt} />;
        })}
      </div>
    </div>
  );
};

const PokemonInfo = ({ name }) => {
  const { status, data, error } = useFetch(`${API}/pokemon/${name}`, [], !name);

  if (status === 'pending') {
    return <p>Fetching pokemon {name}</p>;
  }
  if (status === 'rejected') {
    return <p>{error}</p>;
  }
  if (status === 'idle') {
    return <p>Please enter a pokemon name!</p>;
  }
  if (status !== 'resolved' || !data) {
    throw new Error(`Wrong status ${status}`);
  }
  return <PokemonSuccess {...data} />;
};

const PokemonCard = () => {
  const [name, setName] = React.useState('');

  return (
    <div>
      <input
        placeholder="Enter pokemon name"
        value={name}
        onChange={event => {
          setName(event.target.value.toLowerCase());
        }}
      />
      <PokemonInfo name={name} />
    </div>
  );
};

function App() {
  return <PokemonCard />;
}

export default App;
