INSERT INTO locations (name, lat, lng) VALUES
  ('Mumbai', 19.0760, 72.8777),
  ('Chennai', 13.0827, 80.2707),
  ('Pune', 18.5204, 73.8567);

-- Sample ways and vertices for pgRouting
INSERT INTO ways_vertices_pgr (the_geom) VALUES
  (ST_SetSRID(ST_MakePoint(72.8777, 19.0760), 4326)), -- Mumbai
  (ST_SetSRID(ST_MakePoint(80.2707, 13.0827), 4326)), -- Chennai
  (ST_SetSRID(ST_MakePoint(73.8567, 18.5204), 4326)); -- Pune

INSERT INTO ways (source, target, cost, geom) VALUES
  (1, 2, 1000, ST_SetSRID(ST_MakeLine(ST_MakePoint(72.8777, 19.0760), ST_MakePoint(80.2707, 13.0827)), 4326)),
  (1, 3, 150, ST_SetSRID(ST_MakeLine(ST_MakePoint(72.8777, 19.0760), ST_MakePoint(73.8567, 18.5204)), 4326)),
  (3, 2, 900, ST_SetSRID(ST_MakeLine(ST_MakePoint(73.8567, 18.5204), ST_MakePoint(80.2707, 13.0827)), 4326));
